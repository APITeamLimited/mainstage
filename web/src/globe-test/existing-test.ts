/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobeTestMessage } from '@apiteam/types/src'
import { io, Socket } from 'socket.io-client'

import { refetchRunningCountVar } from 'src/pages/App/CollectionEditorPage/components/StatusBar/running-tests'

import { getUrl, parseMessage } from './execution'

export const streamExistingTest = ({
  jobId,
  scopeId,
  rawBearer,
  onMessage,
}: {
  jobId: string
  scopeId: string
  rawBearer: string
  onMessage: (message: GlobeTestMessage) => void
}): Socket => {
  const socket = io(getUrl(), {
    query: {
      jobId,
      scopeId,
      bearer: rawBearer,
      endpoint: '/current-test',
    },
    path: '/api/test-manager',
    reconnection: true,
  })

  // Messages will need to be parsed
  socket.on('updates', (data: any) => {
    if (data.jobId) {
      const parsedMessage = parseMessage(data)

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
