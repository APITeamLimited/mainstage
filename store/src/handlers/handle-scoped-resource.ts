import { IncomingMessage, ServerResponse } from 'http'

import { GridFSBucket } from 'mongodb'
import * as queryString from 'query-string'

import { mongoDB } from '../mongo'
import { findScope } from '../services'

export const handleScopedResource = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const queryParams = queryString.parse(req.url?.split('?')[1] || '')
  const scopeId = queryParams.scopeId?.toString()
  const resourceId = queryParams.resourceId?.toString()

  if (!scopeId) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'No scopeId' }))
    return
  }

  if (!resourceId) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'No resourceId' }))
    return
  }

  const scope = await findScope(scopeId)

  if (!scope) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'No scope' }))
    return
  }

  const bucketName = `${scope.variant}:${scope.variantTargetId}`

  const bucket = new GridFSBucket(mongoDB, {
    bucketName: bucketName,
  })

  // Check if the resourceId exists in bucket
  const exists = bucket.find({ filename: resourceId }).hasNext()

  if (!exists) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Not Found' }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/octet-stream' })

  const stream = bucket
    .openDownloadStreamByName(resourceId)
    .on('error', () => {
      res.writeHead(500)
      res.end()
    })
    .on('finish', () => {
      res.end()
    })

  stream.on('data', (chunk) => {
    res.write(chunk)
  })
}
