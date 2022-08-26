import { createServer } from 'http'

import { checkValue } from './config'
import { retrieveScopedResource, submitScopedResource } from './handlers'
import { requireScopedAuth } from './services'

process.title = 'store'

const entityEngineHost = checkValue<string>('store.host')
const entityEnginePort = checkValue<number>('store.port')

const httpServer = createServer()

httpServer.addListener('request', (req, res) => {
  const endpoint = req.url?.split('?')[0].replace(/\/$/, '') || '/'

  console.log(`${new Date().toISOString()} ${req.method} ${endpoint}`)

  if (endpoint === '/api/store/retrieve-scoped-resource') {
    requireScopedAuth(req, res, retrieveScopedResource)
  } else if (endpoint === '/api/store/submit-scoped-resource') {
    requireScopedAuth(req, res, submitScopedResource)
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
