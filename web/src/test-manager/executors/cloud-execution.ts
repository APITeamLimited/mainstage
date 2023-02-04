/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecutionParams,
  GlobeTestMessage,
  WrappedExecutionParams,
  parseGlobeTestMessage,
} from '@apiteam/types/src'
import { io } from 'socket.io-client'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { HashSumModule } from 'src/contexts/imports'
import { FocusedElementDictionary } from 'src/contexts/reactives'
import { kvExporter, kvLegacyImporter } from 'src/utils/key-values'

import type { BaseJob, PendingLocalJob } from '../lib'
import { handleRESTAutoFocus } from '../utils'
import {
  testManagerWrappedQuery,
  determineWrappedExecutionParams,
  getTestManagerURL,
} from '../utils'

/*
Executes a queued job and updates the job queue on streamed messages
*/
export const executeCloud = ({
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
  const params = determineWrappedExecutionParams(job, rawBearer)

  try {
    const socket = io(getTestManagerURL(), {
      query: testManagerWrappedQuery(params, '/new-test'),
      path: '/api/test-manager',
      reconnection: false,
    })

    // Messages will need to be parsed
    socket.on('updates', (message: GlobeTestMessage) => {
      if (
        message.messageType === 'COLLECTION_VARIABLES' ||
        message.messageType === 'ENVIRONMENT_VARIABLES'
      ) {
        handleVariableUpdates(
          parseGlobeTestMessage(message) as GlobeTestVariablesMessage,
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

    socket.on('error', (error: string) => {
      snackErrorMessageVar(error)
    })

    if (params.testType === 'rest') {
      handleRESTAutoFocus(focusedResponseDict, workspace, socket, params)
    }
  } catch (error) {
    console.error(error)
    snackErrorMessageVar(
      "Couldn't execute request, an unexpected error occurred"
    )
    return false
  }

  return true
}

export type GlobeTestVariablesMessage = GlobeTestMessage & {
  messageType: 'ENVIRONMENT_VARIABLES' | 'COLLECTION_VARIABLES'
}

export const handleVariableUpdates = (
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

    const collectionVariables = kvLegacyImporter(
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
      kvExporter(
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

    const environmentVariables = kvLegacyImporter(
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
      kvExporter(
        environmentVariables,
        'localvalue',
        activeEnvironmentYMap.doc?.guid as string
      )
    )
  }
}
