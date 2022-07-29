import { createServer } from 'http'

import { Server } from 'socket.io'

import { handleAuth } from './services'
import { handleNewConnection } from './yjs/connection-provider'

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

httpServer.listen(port, host, () => {
  console.log(
    `\x1b[34m\n\nAPITeam Entity Engine Listening at ${host}:${port}\n\n\x1b[0m`
  )
})
