/* eslint-disable @typescript-eslint/no-explicit-any */
import { GlobeTestMessage } from '@apiteam/types/src'
import { io, Socket } from 'socket.io-client'

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
    path: '/api/globe-test',
    reconnection: true,
  })

  // Messages will need to be parsed
  socket.on('updates', (data: any) => {
    if (data.jobId) {
      onMessage(parseMessage(data))
    }
  })

  return socket
}
