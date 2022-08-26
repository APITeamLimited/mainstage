import { IncomingMessage, ServerResponse } from 'http'

import { GridFSBucket } from 'mongodb'
import * as queryString from 'query-string'

import { mongoDB } from '../mongo'
import { findScope } from '../services'

export const submitScopedResource = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Method Not Allowed' }))
    return
  }

  // Ensure multipart/form-data content type
  if (req.headers?.['content-type'] !== 'multipart/form-data') {
    res.writeHead(415, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Unsupported Media Type' }))
    return
  }

  const queryParams = queryString.parse(req.url?.split('?')[1] || '')
  const scopeId = queryParams.scopeId?.toString()

  if (!scopeId) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'No scopeId' }))
    return
  }

  // Get body stream and parse it as multipart/form-data
  const chunks = []

  req.on('data', (chunk) => {
    chunks.push(chunk)
  })

  throw new Error('Not implemented')
}
