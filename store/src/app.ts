import { createServer } from 'http'

import { Color } from 'colorterm'

import { checkValue } from './config'
import { retrieveScopedResource, submitScopedResource } from './handlers'
import { requireScopedAuth } from './services'

process.title = 'store'

const storeHost = '0.0.0.0'
const storePort = checkValue<number>('store.port')

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Disposition',
  'Access-Control-Max-Age': 2592000, // 30 days
}

const httpServer = createServer()

httpServer.addListener('request', (req, res) => {
  const endpoint = req.url?.split('?')[0].replace(/\/$/, '') || '/'

  console.log(`${new Date().toISOString()} ${req.method} ${endpoint}`)

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders)
    res.end()
    return
  }

  if (endpoint === '/api/store/retrieve-scoped-resource') {
    requireScopedAuth(req, res, retrieveScopedResource)
  } else if (endpoint === '/api/store/submit-scoped-resource') {
    requireScopedAuth(req, res, submitScopedResource)
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Not Found' }))
  }
})

if (process.env.NODE_ENV === 'development') {
  // Every minute print memory usage and number of connections
  setInterval(() => {
    console.log(
      Color(
        `${new Date().toISOString()} Memory: ${(
          process.memoryUsage().heapUsed /
          1000 /
          1000
        ).toFixed(2)}MB`,
        '#988adb'
      )
    )
  }, 60000)
}

httpServer.listen(storePort, storeHost, () => {
  console.log(
    Color(
      `\n\nAPITeam Store Listening at ${storeHost}:${storePort}\n\n`,
      '#ade823'
    )
  )
})
