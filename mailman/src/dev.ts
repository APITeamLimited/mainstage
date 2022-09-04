import { createServer } from 'http'

import { handleRenderRequest } from './executor'

// If dev mode, fire up a test node server
export const startDevServer = () => {
  const httpServer = createServer()

  httpServer.listen(3000, '0.0.0.0', () => {
    console.log('Development server listening on port 3000')
  })

  httpServer.on('request', async (req, res) => {
    // Render output for a given job, body is the data
    if (req.url === '/render') {
      const body = (await new Promise((resolve) => {
        let data = ''
        req.on('data', (chunk) => {
          data += chunk
        })
        req.on('end', () => {
          resolve(data)
        })
      })) as string

      try {
        const parsedBody = JSON.parse(body)
        const output = await handleRenderRequest(parsedBody)

        if (output.error) {
          throw new Error(output.error)
        }

        if (!output.content) {
          throw new Error('No content returned')
        }

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(output.content.html)
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: e.message }))
      }
    }
  })
}
