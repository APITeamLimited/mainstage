import { createServer } from 'http'

import { AuthenticatedSocket } from '@apiteam/types'
import { Color } from 'colorterm'
import queryString from 'query-string'
import { Server } from 'socket.io'

import { checkValue } from './config'
import {
  handleCurrentTest,
  handleNewLocalTest,
  handleNewTest,
} from './handlers'
import { handleAuth } from './services'
import { forwardGlobalTestStatistics } from './services/globetest-statistics'

process.title = 'test-manager'

// This will always be localhost, container mapping will set this to the actual hostname
const testManagerHost = '0.0.0.0'
const testManagerPort = checkValue<number>('test-manager.port')

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
  path: '/api/test-manager',
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
    console.log(`Client connected, ${endpoint}`)

    try {
      await handleNewTest(socket as AuthenticatedSocket)
    } catch (error) {
      console.log(error)
      socket.emit('error', 'An unexpected error occurred')
      socket.disconnect()
    }
  } else if (endpoint === '/current-test') {
    console.log(`Client connected, ${endpoint}`)

    try {
      await handleCurrentTest(socket as AuthenticatedSocket)
    } catch (error) {
      console.log(error)
      socket.emit('error', 'An unexpected error occurred')
      socket.disconnect()
    }
  } else if (endpoint === '/new-local-test') {
    console.log(`Client connected, ${endpoint}`)

    try {
      await handleNewLocalTest(socket as AuthenticatedSocket)
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

if (checkValue<boolean>('test-manager.isMaster')) {
  forwardGlobalTestStatistics()
}

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

httpServer.listen(testManagerPort, testManagerHost, () => {
  console.log(
    Color(
      `\n\nAPITeam Test Manager Listening at ${testManagerHost}:${testManagerPort}${io.path()}\n\n`,
      '#f531ca'
    )
  )
})
