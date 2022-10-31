import { createServer } from 'http'

import { AuthenticatedSocket } from '@apiteam/types'
import { Color } from 'colorterm'
import queryString from 'query-string'
import { Server } from 'socket.io'

import { checkValue } from './config'
import { handleCurrentTest, handleNewTest } from './handlers'
import { handleAuth } from './services'

process.title = 'globe-test'

// This will always be localhost, container mapping will set this to the actual hostname
const globeTestHost = '0.0.0.0'
const globeTestPort = checkValue<number>('globe-test.port')

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
  path: '/api/globe-test',
})

io.use(async (socket, next) => {
  const { scope, jwt } = await handleAuth(socket.request)
  if (scope && jwt) {
    ;(socket as AuthenticatedSocket).scope = scope
    ;(socket as AuthenticatedSocket).jwt = jwt

    next()
  } else {
    console.log(new Date(), 'Client failed to authenticate')
    next(new Error('Authentication error'))
  }
}).on('connection', async (socket) => {
  const params = queryString.parse(socket.request.url?.split('?')[1] || '')
  const endpoint = params['endpoint']

  // Already checked query params, just execute
  if (endpoint === '/new-test') {
    console.log('Client connected, /new-test')
    try {
      await handleNewTest(socket as AuthenticatedSocket)
    } catch (error) {
      console.log(error)
      socket.emit('error', 'An unexpected error occurred')
      socket.disconnect()
    }
  } else if (endpoint === '/current-test') {
    try {
      await handleCurrentTest(socket as AuthenticatedSocket)
    } catch (error) {
      console.log(error)
      socket.emit('error', 'An unexpected error occurred')
      socket.disconnect()
    }
  } else {
    socket.emit('error', 'Invalid endpoint')
    socket.disconnect()
  }
})

// Every minute print memory usage and number of connections
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    console.log(
      Color(
        `${new Date().toISOString()} Connections: ${
          io.engine.clientsCount
        } Memory: ${(process.memoryUsage().heapUsed / 1000 / 1000).toFixed(
          2
        )}MB`,
        '#54ff71'
      )
    )
  }, 60000)
}

httpServer.listen(globeTestPort, globeTestHost, () => {
  console.log(
    Color(
      `\n\nAPITeam GlobeTest Manager Listening at ${globeTestHost}:${globeTestPort}${io.path()}\n\n`,
      '#f531ca'
    )
  )
})
