import { createServer } from 'http'

import { Server } from 'socket.io'

import { checkValue } from './config'
import { handleCurrentTest, handleNewTest } from './handle-test'
import { checkJobId, checkValidQueryParams } from './middleware'
import { handleAuth } from './services'

process.title = 'globe-test'

// This will always be localhost, container mapping will set this to the actual hostname
const globeTestHost = 'localhost'
const globeTestPort = checkValue<number>('globeTest.port')

const httpServer = createServer()

const io = new Server(httpServer, {
  // Disable cors
  // TODO: Refine cors to only allow whitelisted origins
  allowRequest: () => true,
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

io.of('/new-test')
  .use((socket, next) => {
    if (checkValidQueryParams(socket.request)) {
      next()
    } else {
      next(new Error('Invalid query parameters'))
    }
  })
  .on('connection', async (socket) => {
    console.log(new Date(), '/new-test client connected', socket.id)
    await handleNewTest(socket)
  })

io.of('/current-test')
  .use(async (socket, next) => {
    if (await checkJobId(socket.request)) {
      next()
    } else {
      next(new Error('Invalid jobId'))
    }
  })
  .on('connection', async (socket) => {
    console.log(new Date(), '/current-test client connected', socket.id)
    await handleCurrentTest(socket)
  })

// Every minute print memory usage and number of connections
setInterval(() => {
  console.log(
    `\x1b[36m${new Date().toISOString()} Connections: ${
      io.engine.clientsCount
    } Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
      2
    )}MB\x1b[0m`
  )
}, 60000)

httpServer.listen(globeTestPort, globeTestHost, () => {
  console.log(
    `\x1b[31m\n\nAPITeam GlobeTest Manager Listening at ${globeTestHost}:${globeTestPort}\n\n\x1b[0m`
  )
})
