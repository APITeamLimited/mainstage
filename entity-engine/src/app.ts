import { createServer } from 'http'

import { Color } from 'colorterm'
import { Server } from 'socket.io'

import { checkValue } from './config'
import { configureInspector } from './dev-utils'
import { handleAuth } from './services'
import { handleNewConnection } from './yjs/connection-provider'
import { registerDeleteHandlers } from './yjs/delete-handler'
import { createServersideHandlers } from './yjs/serverside'

process.title = 'entity-engine'

const handleInit = async () => {
  configureInspector()

  const entityEngineHost = '0.0.0.0'
  const entityEnginePort = checkValue<number>('entity-engine.port')

  const httpServer = createServer()

  const clientIoServer = new Server(httpServer, {
    cors: {
      origin: '*',
    },
    path: '/api/entity-engine',
  })

  clientIoServer.use(async (socket, next) => {
    const didAuthenticate = await handleAuth(socket.request)
    if (didAuthenticate) {
      console.log(new Date(), 'Client authenticated')
      next()
    } else {
      console.log(new Date(), 'Client failed to authenticate')
      next(new Error('Authentication error'))
    }
  })

  clientIoServer.on(
    'connection',
    async (socket) => await handleNewConnection(socket)
  )

  clientIoServer.on('disconnect', () =>
    console.log(new Date(), 'Client disconnected')
  )

  registerDeleteHandlers()

  // Support intrnal serverside connections
  const serversideServers = createServersideHandlers(httpServer)

  // if (process.env.NODE_ENV === 'development') {
  // Every minute print memory usage and number of connections
  setInterval(() => {
    let serversideConnections = 0

    serversideServers.forEach((server) => {
      serversideConnections += server.engine.clientsCount
    })

    console.log(
      Color(
        `${new Date().toISOString()} Connections: ${
          clientIoServer.engine.clientsCount
        } Serverside Connections: ${serversideConnections} Memory: ${(
          process.memoryUsage().heapUsed /
          1000 /
          1000
        ).toFixed(2)}MB`,
        '#70c289'
      )
    )
  }, 60000)
  // }

  httpServer.listen(entityEnginePort, entityEngineHost, () => {
    console.log(
      Color(
        `\n\nAPITeam Entity Engine Listening at ${entityEngineHost}:${entityEnginePort}\n\n`,
        '#d11515'
      )
    )
  })
}

handleInit()
