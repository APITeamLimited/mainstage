import { IncomingMessage, ServerResponse } from 'http'
import { Readable } from 'stream'

import busboy from 'busboy'
import { GridFSBucket } from 'mongodb'
import * as queryString from 'query-string'
import { v4 as uuid } from 'uuid'

import { corsHeaders } from '../app'
import { mongoDB } from '../mongo'
import { findScope } from '../services'

export const submitScopedResource = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'Method Not Allowed' }))
    return
  }

  const isMultipartFormData = req.headers['content-type']?.includes(
    'multipart/form-data'
  )

  // Ensure multipart/form-data content type
  if (!isMultipartFormData) {
    res.writeHead(415, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'Unsupported Media Type' }))
    return
  }

  const queryParams = queryString.parse(req.url?.split('?')[1] || '')
  const scopeId = queryParams.scopeId?.toString()

  if (!scopeId) {
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'No scopeId' }))
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

  // Get body stream and parse it as multipart/form-data
  const bb = busboy({ headers: req.headers })

  let fileFound: string | undefined = undefined

  bb.on('file', async (name, file, info) => {
    if (fileFound) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders })
      res.end(JSON.stringify({ message: 'Multiple files not allowed' }))
      return
    }

    fileFound = info.filename

    processFile(info, file, bucket, res)
  })

  bb.on('close', () => {
    if (!fileFound) {
      res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders })
      res.end(JSON.stringify({ message: 'No file found' }))
      return
    }

    // Set a 1 minute timeout for the request
    setTimeout(() => {
      res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
      res.end(JSON.stringify({ message: 'Timeout' }))
    }, 60000)
  })

  req.pipe(bb)
}

/*
Takes the upload stream and directly pipes it to Mongo
*/
const processFile = async (
  info: busboy.FileInfo,
  file: Readable,
  bucket: GridFSBucket,
  res: ServerResponse
) => {
  const { filename, mimeType } = info

  // Give actual filename a random uuid to avoid collisions,
  // but keep the original filename in metadata
  const uploadStream = bucket.openUploadStream(uuid(), {
    contentType: mimeType,
    metadata: {
      filename,
    },
  })

  uploadStream.on('error', (error) => {
    console.log(error)
    res.writeHead(500, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'Error uploading file' }))
  })

  file.on('data', (data) => {
    uploadStream.write(data)
  })

  file.on('close', async () => {
    uploadStream.end()
  })

  uploadStream.on('finish', () => {
    res.writeHead(201, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ storeReceipt: uploadStream.id.toString() }))
  })
}
