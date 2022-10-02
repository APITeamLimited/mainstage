import { GlobeTestMessage, WrappedExecutionParams } from '@apiteam/types'
import { makeVar } from '@apollo/client'
import { io, Socket } from 'socket.io-client'
import * as Y from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { FocusedElementDictionary } from 'src/contexts/reactives'
import { updateFocusedRESTResponse } from 'src/pages/App/CollectionEditorPage/components/collection-editor/RESTResponsePanel'

import {
  BaseJob,
  ExecutingJob,
  PostExecutionJob,
  jobQueueVar,
  PendingLocalJob,
  QueuedJob,
  updateFilterQueue,
} from './lib'
import {
  addOptionsToRESTJob,
  ensureRESTResponseExists,
  postProcessRESTRequest,
} from './processors'

const getUrl = () => {
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

type ExecuteArgs = {
  queueRef: React.MutableRefObject<QueuedJob[] | null>
  job: BaseJob & PendingLocalJob
  rawBearer: string
  workspace: Y.Doc
  focusedResponseDict: FocusedElementDictionary
}

/*
Executes a queued job and updates the job queue on streamed messages
*/
export const execute = ({
  queueRef,
  job,
  rawBearer,
  workspace,
  focusedResponseDict,
}: ExecuteArgs): boolean => {
  let params: WrappedExecutionParams | null = null

  if (job.restRequest) {
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
      restRequest: job.restRequest,
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

    socket.on('updates', (message) => {
      console.log('Received message', message)

      if (message.messageType === 'STATUS') {
        if (
          message.message === 'COMPLETED_SUCCESS' ||
          message.message === 'COMPLETED_FAILED'
        ) {
          socket.disconnect()
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
  workspace: Y.Doc,
  socket: Socket,
  params: WrappedExecutionParams
) => {
  socket.on(
    'rest-create-response:success',
    async ({ responseId }: { responseId: string }) => {
      console.log("Received 'rest-create-response:success' message", responseId)

      const tryFindResponse = async (count = 0): Promise<Y.Map<any>> => {
        const restResponseYMap = workspace
          .getMap<any>('projects')
          ?.get(params.projectId)
          ?.get('branches')
          ?.get(params.branchId)
          ?.get('collections')
          ?.get(params.collectionId)
          ?.get('restResponses')
          ?.get(responseId) as Y.Map<any>

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

        return restResponseYMap as Y.Map<any>
      }

      const restResponseYMap = await tryFindResponse()

      console.log('REST response YMap', restResponseYMap)
      updateFocusedRESTResponse(focusedResponseDict, restResponseYMap)
    }
  )
}

export const parseMessage = (message: any) => {
  if (
    message.messageType === 'SUMMARY_METRICS' ||
    message.messageType === 'METRICS' ||
    message.messageType === 'MARK' ||
    message.messageType === 'JOB_INFO' ||
    message.messageType === 'CONSOLE' ||
    message.messageType === 'OPTIONS'
  ) {
    message.message = JSON.parse(message.message)
    message.time = new Date(message.time)
  }

  if (message.workerId === '' && message.orchestratorId !== '') {
    delete message.workerId
  }

  if (message.orchestratorId === '' && message.workerId !== '') {
    delete message.orchestratorId
  }

  return message as GlobeTestMessage
}
