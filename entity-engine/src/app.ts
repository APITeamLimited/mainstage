import { createServer } from 'http'

import { Server } from 'socket.io'

import { handleAuth } from './services'
import { handleNewConnection } from './yjs/connection-provider'

process.title = 'entity-engine'

const host = 'localhost' //checkValue<string>('entity-engine.host')
const port = 8912 //checkValue<number>('entity-engine.port')

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:8910', 'http://localhost:8912'],
    methods: ['GET', 'POST'],
  },
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
  console.log(new Date(), 'Socket.io Client connected', socket.id)
  await handleNewConnection(socket)
})

// Every minute print memory usage and number of connections
setInterval(() => {
  console.log(
    `\x1b[33m${new Date().toISOString()} Connections: ${
      io.engine.clientsCount
    } Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
      2
    )}MB\x1b[0m`
  )
}, 60000)

httpServer.listen(port, host, () => {
  console.log(
    `\x1b[34m\n\nAPITeam Entity Engine Listening at ${host}:${port}\n\n\x1b[0m`
  )
})
