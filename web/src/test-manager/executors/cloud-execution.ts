/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ExecutionParams,
  GlobeTestMessage,
  WrappedExecutionParams,
  parseGlobeTestMessage,
} from '@apiteam/types'
import { io } from 'socket.io-client'
import type { Doc as YDoc, Map as YMap } from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { HashSumModule } from 'src/contexts/imports'
import { FocusedElementDictionary } from 'src/contexts/reactives'

import type { BaseJob, PendingJob } from '../lib'
import { handleTestAutoFocus } from '../test-auto-focus'
import { determineWrappedExecutionParams, getTestManagerURL } from '../utils'
import {
  GlobeTestVariablesMessage,
  handleVariableUpdates,
} from '../variable-updates'

/** Executes a queued job and updates the job queue on streamed messages */
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
  job: BaseJob & PendingJob
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
      query: {
        bearer: rawBearer,
        scopeId: params.scopeId,
        endpoint: '/new-test',
      },
      path: '/api/test-manager',
      reconnection: false,
    })

    socket.on('connect', async () => {
      let acknowledged = false

      socket.once('paramsAcknowledged', () => {
        acknowledged = true
      })

      while (!acknowledged) {
        if (!socket.connected) {
          return
        }

        socket.emit('params', params)

        await new Promise((resolve) => setTimeout(resolve, 200))
      }
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

    handleTestAutoFocus(focusedResponseDict, workspace, socket, params)
  } catch (error) {
    console.error(error)
    snackErrorMessageVar(
      "Couldn't execute request, an unexpected error occurred"
    )
    return false
  }

  return true
}
