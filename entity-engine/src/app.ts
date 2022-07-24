import http from 'http'

import WebSocket from 'ws'

import { handleAuth } from './services/auth'
import { setupWSConnection } from './yjs'

const host = 'localhost' //checkValue<string>('entity-engine.host')
const port = 8912 //checkValue<number>('entity-engine.port')

const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', setupWSConnection)

const server = http.createServer((request, response) => {
  console.log(new Date() + ' Received request for ' + request.url)
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('APITeam Entity Engine here, hello!')
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(
    request,
    socket,
    head,
    async (client: WebSocket.WebSocket, request: http.IncomingMessage) => {
      const didAuthenticate = await handleAuth(client, request)
      if (didAuthenticate) {
        console.log(new Date(), 'Client authenticated')
        wss.emit('connection', socket, request, client)
      } else {
        console.log(new Date(), 'Client failed to authenticate')
      }
    }
  )
})

server.listen(port, host, () => {
  console.log(
    `\x1b[34m\n\nAPITeam Entity Engine Listening at ${host}:${port}\n\n\x1b[0m`
  )
})
