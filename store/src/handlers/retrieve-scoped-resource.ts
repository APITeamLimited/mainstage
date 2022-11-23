import type { IncomingMessage, ServerResponse } from 'http'

import { GridFSBucket, ObjectId } from 'mongodb'
import * as queryString from 'query-string'

import { corsHeaders } from '../app'
import { mongoDB } from '../mongo'
import { findScope } from '../services'

export const retrieveScopedResource = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'Method Not Allowed' }))
    return
  }

  const queryParams = queryString.parse(req.url?.split('?')[1] || '')
  const scopeId = queryParams.scopeId?.toString()
  const storeReceipt = queryParams.storeReceipt?.toString()

  if (!scopeId) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'No scopeId' }))
    return
  }

  if (!storeReceipt) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'No storeReceipt' }))
    return
  }

  const scope = await findScope(scopeId)

  if (!scope) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'No scope' }))
    return
  }

  const bucketName = `${scope.variant}:${scope.variantTargetId}`

  const bucket = new GridFSBucket(mongoDB, { bucketName })

  let storeReceiptObjectId = null as ObjectId | null

  try {
    storeReceiptObjectId = new ObjectId(storeReceipt)
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(
      JSON.stringify({ message: `Invalid storeReceipt: ${storeReceipt}` })
    )
    return
  }

  // Check if the resourceId exists in bucket
  const file = await bucket.find({ _id: storeReceiptObjectId }).next()

  if (!file) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(
      JSON.stringify({
        message: 'File not found in workspace',
        detail: `File with store receipt ${storeReceipt} not found in workspace ${bucketName}`,
      })
    )
    return
  }

  if (!file.metadata) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(
      JSON.stringify({
        message: 'File metadata not found',
        detail: `File with store receipt ${storeReceipt} has no metadata`,
      })
    )
    return
  }

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    // Write filename to headers
    'Content-Disposition': `attachment; filename=${file.metadata.filename}`,
    ...corsHeaders,
  })

  const stream = bucket
    .openDownloadStream(storeReceiptObjectId)
    .on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
      console.log(err)
      res.end()
    })
    .on('end', () => {
      res.end()
    })

  stream.on('data', (chunk) => {
    res.write(chunk)
  })
}
