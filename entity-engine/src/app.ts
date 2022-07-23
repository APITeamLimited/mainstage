import http from 'http'

import WebSocket from 'ws'

import { checkValue } from './config'
import { handleAuth } from './services/auth'
import { setupWSConnection } from './yjs'

const host = checkValue<string>('entity-engine.host')
const port = checkValue<number>('entity-engine.port')

const wss = new WebSocket.Server({ noServer: true })

wss.on('connection', setupWSConnection)

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(
    request,
    socket,
    head,
    async (client: WebSocket.WebSocket, request: http.IncomingMessage) => {
      const didAuthenticate = await handleAuth(client, request)
      if (didAuthenticate) {
        wss.emit('connection', socket, request, client)
      }
    }
  )
})

console.log(
  `\x1b[34m\n\nAPITeam Entity Engine Listening at ${host}:${port}\n\n`
)
