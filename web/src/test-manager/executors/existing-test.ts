/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobeTestMessage, parseGlobeTestMessage } from '@apiteam/types/src'
import { io, Socket } from 'socket.io-client'

import { refetchRunningCountVar } from 'src/pages/App/CollectionEditorPage/components/StatusBar/running-tests'

import { getTestManagerURL } from '../utils'

export const streamExistingTest = ({
  jobId,
  scopeId,
  rawBearer,
  onMessage,
  executionAgent,
}: {
  jobId: string
  scopeId: string
  rawBearer: string
  onMessage: (message: GlobeTestMessage) => void
  executionAgent: 'Local' | 'Cloud'
}): Socket => {
  const socket = io(getTestManagerURL(), {
    query: {
      jobId,
      scopeId,
      bearer: rawBearer,
      executionAgent,
      endpoint: '/current-test',
    },
    path: '/api/test-manager',
    reconnection: true,
  })

  // Messages will need to be parsed
  socket.on('updates', (data: any) => {
    if (data.jobId) {
      const parsedMessage = parseGlobeTestMessage(data)

      if (parsedMessage.messageType === 'STATUS') {
        if (
          parsedMessage.message === 'SUCCESS' ||
          parsedMessage.message === 'FAILURE'
        ) {
          refetchRunningCountVar(Math.random())
        }
      }

      onMessage(parsedMessage)
    }
  })

  return socket
}
