import { GlobeTestMessage } from '@apiteam/types/src'
import { io, Socket } from 'socket.io-client'

import { getUrl } from './execution'

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

  socket.on('updates', (data) => {
    if (data.jobId) {
      onMessage(data)
    }
  })

  return socket
}
