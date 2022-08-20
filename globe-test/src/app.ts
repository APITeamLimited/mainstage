import { createServer } from 'http'

import queryString from 'query-string'
import { Server } from 'socket.io'

import { checkValue } from './config'
import { handleCurrentTest, handleNewTest } from './handle-test'
import { checkJobId, checkValidQueryParams } from './middleware'
import { handleAuth } from './services'

process.title = 'globe-test'

// This will always be localhost, container mapping will set this to the actual hostname
const globeTestHost = checkValue<number>('globe-test.host')
const globeTestPort = checkValue<number>('globe-test.port')

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
  path:
    process.env.NODE_ENV === 'development' ? '/socket-io' : '/api/globe-test',
})

io.use(async (socket, next) => {
  const didAuthenticate = await handleAuth(socket.request)
  if (didAuthenticate) {
    const params = queryString.parse(socket.request.url?.split('?')[1] || '')
    const endpoint = params['endpoint']

    if (endpoint === '/new-test') {
      if (checkValidQueryParams(socket.request)) {
        console.log(new Date(), 'Client authenticated, /new-test')
        next()
      } else {
        next(new Error('Invalid query parameters'))
      }
    } else if (endpoint === 'current-test') {
      if (await checkJobId(socket.request)) {
        console.log(new Date(), 'Client authenticated, /current-test')
        next()
      } else {
        next(new Error('Invalid jobId'))
      }
    }
  } else {
    console.log(new Date(), 'Client failed to authenticate')
    next(new Error('Authentication error'))
  }
}).on('connection', async (socket) => {
  const params = queryString.parse(socket.request.url?.split('?')[1] || '')
  const endpoint = params['endpoint']

  // Already checked query params, just execute
  if (endpoint === '/new-test') {
    await handleNewTest(socket)
  } else if (endpoint === 'current-test') {
    await handleCurrentTest(socket)
  } else {
    socket.disconnect()
  }
})

// Every minute print memory usage and number of connections
setInterval(() => {
  console.log(
    `\x1b[36m${new Date().toISOString()} Connections: ${
      io.engine.clientsCount
    } Memory: ${(process.memoryUsage().heapUsed / 1000 / 1000).toFixed(
      2
    )}MB\x1b[0m`
  )
}, 60000)

httpServer.listen(globeTestPort, globeTestHost, () => {
  console.log(
    `\x1b[31m\n\nAPITeam GlobeTest Manager Listeniang at ${globeTestHost}:${globeTestPort}${io.path()}\n\n\x1b[0m`
  )
})
