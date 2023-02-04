import { Server as HttpServer } from 'http'

import { Socket, Server } from 'socket.io'
import * as Y from 'yjs'

import { handleAuth } from '../../services'
import { getOpenDoc } from '../connection-provider'
import { handlePostAuth } from '../utils'

import { handleGlobetest } from './globetest'

export const createServersideHandlers = (httpServer: HttpServer) => {
  const servers = new Map<string, Server>()

  const globetestIoServer = new Server(httpServer, {
    cors: {
      origin: '*',
    },
    path: '/internal/entity-engine/test-manager',
  })

  globetestIoServer.use(async (socket, next) => {
    const didAuthenticate = await handleAuth(socket.request)
    if (didAuthenticate) {
      console.log(new Date(), 'GlobeTest internal client authenticated')
      next()
    } else {
      console.log(new Date(), 'GlobeTest server failed to authenticate')
      next(new Error('Authentication error'))
    }
  })

  globetestIoServer.on(
    'connection',
    async (socket) =>
      await handleNewServersideConnection(socket, handleGlobetest)
  )

  globetestIoServer.on('disconnect', () => {
    console.log(new Date(), 'GlobeTest internal client disconnected')
  })

  servers.set('globetest', globetestIoServer)

  return servers
}

const handleNewServersideConnection = async (
  socket: Socket,
  manager: (socket: Socket, doc: Y.Doc) => void
) => {
  // User users credentials to get scope
  const postAuth = await handlePostAuth(socket)

  if (postAuth === null) {
    console.error('Failed to carry out post-auth')
    socket.disconnect(true)
    return
  }

  // Disconnect after 60 seconds of inactivity
  let timeoutId = setTimeout(() => {
    socket.disconnect(true)
  }, 60 * 1000)

  socket.on('message', () => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      socket.disconnect(true)
    }, 60 * 1000)
  })

  const doc = await getOpenDoc(postAuth.scope)
  doc.serversideSockets.add(socket)

  socket.on('disconnect', () => doc.deleteServersideSocket(socket))

  // Connect event handlers
  manager(socket, doc)

  socket.emit('serverside-ready')
}
