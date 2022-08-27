import { IncomingMessage, ServerResponse } from 'http'

import { GridFSBucket } from 'mongodb'
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
  const filename = queryParams.filename?.toString()

  if (!scopeId) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'No scopeId' }))
    return
  }

  if (!filename) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'No filename' }))
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

  // Check if the resourceId exists in bucket
  const file = bucket.find({ filename })

  if (!file.hasNext()) {
    res.writeHead(404, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(
      JSON.stringify({
        message: 'File not found in workspace',
        detail: `File ${filename} not found in workspace ${bucketName}`,
      })
    )
    return
  }

  // Get mime type from file
  //const mimeType = await file.next().then((file) => file.contentType)

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    ...corsHeaders,
  })

  //console.log(
  //  'loading file' + filename + ' from workspace ' + bucketName + '...'
  //)

  const stream = bucket
    .openDownloadStreamByName(filename)
    .on('error', (err) => {
      //res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
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
