import { createServer } from 'http'

import { checkValue } from './config'
import { handleScopedResource } from './handlers'
import { requireScopedAuth } from './services'

process.title = 'store'

const entityEngineHost = checkValue<string>('store.host')
const entityEnginePort = checkValue<number>('store.port')

const httpServer = createServer()

httpServer.addListener('request', (req, res) => {
  if (req.url?.startsWith('/api/store')) {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`)

    if (req.url?.startsWith('/api/store/scoped-resource')) {
      requireScopedAuth(req, res, handleScopedResource)
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Not Found' }))
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Not Found' }))
  }
})

// Every minute print memory usage and number of connections
setInterval(() => {
  console.log(
    `\x1b[32m${new Date().toISOString()} Memory: ${(
      process.memoryUsage().heapUsed /
      1000 /
      1000
    ).toFixed(2)}MB\x1b[0m`
  )
}, 60000)

httpServer.listen(entityEnginePort, entityEngineHost, () => {
  console.log(
    `\x1b[31m\n\nAPITeam Store Listening at ${entityEngineHost}:${entityEnginePort}\n\n\x1b[0m`
  )
})
