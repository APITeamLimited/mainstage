import { createServer } from 'http'

import { Color } from 'colorterm'
import { Server } from 'socket.io'

import { checkValue } from './config'
import { handleAuth } from './services'
import { handleNewConnection } from './yjs/connection-provider'

process.title = 'entity-engine'

const entityEngineHost = '0.0.0.0'
const entityEnginePort = checkValue<number>('entity-engine.port')

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
  path: '/api/entity-engine',
})

io.use(async (socket, next) => {
  const didAuthenticate = await handleAuth(socket.request)
  if (didAuthenticate) {
    console.log(new Date(), 'Client authenticated')
    next()
  } else {
    console.log(new Date(), 'Client failed to authenticate')
    next(new Error('Authentication error'))
  }
})

io.on('connection', async (socket) => {
  await handleNewConnection(socket)
})

// Every minute print memory usage and number of connections
setInterval(() => {
  console.log(
    Color(
      `${new Date().toISOString()} Connections: ${
        io.engine.clientsCount
      } Memory: ${(process.memoryUsage().heapUsed / 1000 / 1000).toFixed(2)}MB`,
      '#70c289'
    )
  )
}, 60000)

httpServer.listen(entityEnginePort, entityEngineHost, () => {
  console.log(
    Color(
      `\n\nAPITeam Entity Engine Listening at ${entityEngineHost}:${entityEnginePort}\n\n`,
      '#d11515'
    )
  )
})
