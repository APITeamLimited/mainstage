/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecutionParams,
  GlobeTestMessage,
  kvExporter,
  kvLegacyImporter,
  LocalValueKV,
  WrappedExecutionParams,
} from '@apiteam/types/src'
import { io, Socket } from 'socket.io-client'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { updateFocusedRESTResponse } from 'src/contexts/focused-response'
import { HashSumModule } from 'src/contexts/imports'
import { FocusedElementDictionary } from 'src/contexts/reactives'

import type { BaseJob, PendingLocalJob } from './lib'

export const getUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    const host = process.env['GLOBE_TEST_HOST']
    const port = process.env['GLOBE_TEST_PORT']

    if (!(host && port)) {
      throw new Error(
        `GLOBE_TEST_HOST and GLOBE_TEST_PORT must be set, got ${host} and ${port}`
      )
    }

    return `http://${host}:${port}`
  } else {
    // Get current domain
    const domain = window.location.hostname
    return `https://${domain}`
  }
}

/*
Executes a queued job and updates the job queue on streamed messages
*/
export const execute = ({
  job,
  rawBearer,
  workspace,
  focusedResponseDict,
  environmentContext,
  collectionContext,
  hashSumModule,
  activeEnvironmentYMap,
}: {
  job: BaseJob & PendingLocalJob
  rawBearer: string
  workspace: YDoc
  focusedResponseDict: FocusedElementDictionary
  environmentContext: ExecutionParams['environmentContext']
  collectionContext: ExecutionParams['collectionContext']
  hashSumModule: HashSumModule
  activeEnvironmentYMap: YMap<any> | null
}): boolean => {
  let params: WrappedExecutionParams | null = null

  if (
    job.finalRequest &&
    job.underlyingRequest &&
    job.underlyingRequest.__typename === 'RESTRequest'
  ) {
    params = {
      bearer: rawBearer,
      scopeId: job.scopeId,
      projectId: job.projectId,
      branchId: job.branchId,
      testType: 'rest',
      collectionId: job.collectionId,
      underlyingRequest: job.underlyingRequest,
      source: job.source,
      sourceName: job.sourceName,
      environmentContext: job.environmentContext,
      collectionContext: job.collectionContext,
      finalRequest: job.finalRequest,
    }
  } else {
    throw new Error('Unknown test type')
  }

  try {
    const socket = io(getUrl(), {
      // JSON stringify objects
      query: Object.entries(params).reduce(
        (acc, [key, value]) => {
          if (typeof value === 'object') {
            return {
              ...acc,
              [key]: JSON.stringify(value),
            }
          } else {
            return {
              ...acc,
              [key]: value,
            }
          }
        },
        {
          endpoint: '/new-test',
        }
      ),
      path: '/api/globe-test',
      reconnection: false,
    })

    // Messages will need to be parsed
    socket.on('updates', (message: any) => {
      if (
        message.messageType === 'COLLECTION_VARIABLES' ||
        message.messageType === 'ENVIRONMENT_VARIABLES'
      ) {
        handleVariableUpdates(
          parseMessage(message) as GlobeTestVariablesMessage,
          workspace,
          params as WrappedExecutionParams,
          environmentContext,
          collectionContext,
          hashSumModule,
          activeEnvironmentYMap
        )
      } else if (message.messageType === 'STATUS') {
        if (
          message.message === 'COMPLETED_SUCCESS' ||
          message.message === 'COMPLETED_FAILURE'
        ) {
          setTimeout(() => socket.disconnect(), 1000)
        }
      }
    })

    if (params.testType === 'rest') {
      handleRESTAutoFocus(focusedResponseDict, workspace, socket, params)
    }
  } catch (error) {
    snackErrorMessageVar(
      "Couldn't execute request, an unexpected error occurred"
    )
    return false
  }

  return true
}

const handleRESTAutoFocus = (
  focusedResponseDict: FocusedElementDictionary,
  workspace: YDoc,
  socket: Socket,
  params: WrappedExecutionParams
) => {
  socket.on(
    'rest-create-response:success',
    async ({ responseId }: { responseId: string }) => {
      const tryFindResponse = async (count = 0): Promise<YMap<any>> => {
        const restResponseYMap = workspace
          .getMap<any>('projects')
          ?.get(params.projectId)
          ?.get('branches')
          ?.get(params.branchId)
          ?.get('collections')
          ?.get(params.collectionId)
          ?.get('restResponses')
          ?.get(responseId) as YMap<any>

        if (!restResponseYMap) {
          if (count >= 10) {
            throw new Error(
              `Couldn't find response with id ${responseId} after ${count} tries`
            )
          }

          // Increasing backoff
          await new Promise((resolve) => setTimeout(resolve, (count + 1) * 100))
          return tryFindResponse(count + 1)
        }

        return restResponseYMap as YMap<any>
      }

      const restResponseYMap = await tryFindResponse()

      updateFocusedRESTResponse(focusedResponseDict, restResponseYMap)
    }
  )
}

type GlobeTestVariablesMessage = GlobeTestMessage & {
  messageType: 'ENVIRONMENT_VARIABLES' | 'COLLECTION_VARIABLES'
}

const handleVariableUpdates = (
  message: GlobeTestVariablesMessage,
  workspace: YDoc,
  params: WrappedExecutionParams,
  environmentContext: ExecutionParams['environmentContext'],
  collectionContext: ExecutionParams['collectionContext'],
  hashSumModule: HashSumModule,
  activeEnvironmentYMap: YMap<any> | null
) => {
  const { default: hash } = hashSumModule

  if (message.messageType === 'COLLECTION_VARIABLES') {
    const collectionYMap = workspace
      .getMap<any>('projects')
      ?.get(params.projectId)
      ?.get('branches')
      ?.get(params.branchId)
      ?.get('collections')
      ?.get(params.collectionId) as YMap<any> | undefined

    if (!collectionYMap) {
      throw new Error(`Couldn't find collection with id ${params.collectionId}`)
    }

    if (hash(message.message) === hash(collectionContext)) {
      // No changes to the variables
      return
    }

    const collectionVariables = kvLegacyImporter<LocalValueKV>(
      'variables',
      collectionYMap,
      'localvalue'
    )

    // Clear deleted variables
    const messageKeys = Object.keys(message.message)
    collectionVariables.forEach((variable) => {
      if (!messageKeys.includes(variable.keyString)) {
        variable.localValue = {
          ...variable.localValue,
          data: null,
        }
      }
    })

    // Update changed variables
    collectionVariables.forEach((variable) => {
      const newValue = message.message[variable.keyString]

      if (newValue === undefined) {
        return
      }

      if (
        newValue === variable.value &&
        (variable.localValue.data === '' || variable.localValue.data === null)
      ) {
        return
      }

      if (newValue === variable.value) {
        variable.localValue = {
          ...variable.localValue,
          data: null,
        }
        return
      }

      variable.localValue = {
        ...variable.localValue,
        data: newValue,
      }
    })

    collectionYMap.set(
      'variables',
      kvExporter<LocalValueKV>(
        collectionVariables,
        'localvalue',
        collectionYMap.doc?.guid as string
      )
    )
  } else if (message.messageType === 'ENVIRONMENT_VARIABLES') {
    if (hash(message.message) === hash(environmentContext)) {
      // No changes to the variables
      return
    }

    if (!activeEnvironmentYMap) {
      throw new Error(
        `Cannot set environment variables without an active environment`
      )
    }

    const environmentVariables = kvLegacyImporter<LocalValueKV>(
      'variables',
      activeEnvironmentYMap,
      'localvalue'
    )

    // Clear deleted variables
    const messageKeys = Object.keys(message.message)
    environmentVariables.forEach((variable) => {
      if (!messageKeys.includes(variable.keyString)) {
        variable.localValue = {
          ...variable.localValue,
          data: null,
        }
      }
    })

    // Update changed variables
    environmentVariables.forEach((variable) => {
      const newValue = message.message[variable.keyString]

      if (newValue === undefined) {
        return
      }

      if (
        newValue === variable.value &&
        (variable.localValue.data === '' || variable.localValue.data === null)
      ) {
        return
      }

      if (newValue === variable.value) {
        variable.localValue = {
          ...variable.localValue,
          data: null,
        }
        return
      }

      variable.localValue = {
        ...variable.localValue,
        data: newValue,
      }
    })

    activeEnvironmentYMap.set(
      'variables',
      kvExporter<LocalValueKV>(
        environmentVariables,
        'localvalue',
        activeEnvironmentYMap.doc?.guid as string
      )
    )
  }
}

export const parseMessage = (message: any) => {
  if (
    message.messageType === 'SUMMARY_METRICS' ||
    message.messageType === 'METRICS' ||
    message.messageType === 'JOB_INFO' ||
    message.messageType === 'CONSOLE' ||
    message.messageType === 'OPTIONS' ||
    message.messageType === 'ENVIRONMENT_VARIABLES' ||
    message.messageType === 'COLLECTION_VARIABLES'
  ) {
    message.message = JSON.parse(message.message)
    message.time = new Date(message.time)

    if (message.messageType === 'CONSOLE') {
      try {
        message.message.msg = JSON.parse(message.message.msg)
      } catch (error) {
        // Do nothing
      }
    }
  }

  if (message.workerId === '' && message.orchestratorId !== '') {
    delete message.workerId
  }

  if (message.orchestratorId === '' && message.workerId !== '') {
    delete message.orchestratorId
  }

  if (message.workerId && message.orchestratorId) {
    delete message.orchestratorId
  }

  return message as GlobeTestMessage
}
