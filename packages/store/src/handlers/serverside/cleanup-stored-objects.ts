import type { IncomingMessage, ServerResponse } from 'http'

import { GridFSBucket, ObjectId } from 'mongodb'

import { corsHeaders } from '../../app'
import { mongoDB } from '../../mongo'

export const cleanupStoredObjects = async (
  req: IncomingMessage,
  res: ServerResponse,
  variant: 'USER' | 'TEAM',
  variantTargetId: string
) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'Method Not Allowed' }))
    return
  }

  // Check is application/json and parse

  if (!req.headers['content-type']?.includes('application/json')) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(
      JSON.stringify({ message: 'Content-Type must be application/json' })
    )
    return
  }

  const body = await new Promise<string>((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', () => {
      resolve(body.toString())
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.on('close', () => {
      reject(new Error('Request closed'))
    })

    req.on('aborted', () => {
      reject(new Error('Request aborted'))
    })
  })

  const storeReceipts = JSON.parse(body)

  if (!Array.isArray(storeReceipts)) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders })
    res.end(JSON.stringify({ message: 'Body must be an array' }))
    return
  }

  await cleanupBucket(variant, variantTargetId, storeReceipts)

  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders })
  res.end(JSON.stringify({ message: 'OK' }))
}

export const cleanupBucket = async (
  variant: 'USER' | 'TEAM',
  variantTargetId: string,
  trackedIds: string[]
) => {
  const bucket = new GridFSBucket(mongoDB, {
    bucketName: `${variant}:${variantTargetId}`,
  })

  const cursor = bucket.find()

  const storeIds = await cursor
    .toArray()
    .then((files) => files.map((file) => file._id))

  // Find all storeIds that are not tracked
  const storeIdsToDelete = storeIds.filter(
    (storeId) => !trackedIds.includes(storeId.toHexString())
  )

  // Query all stored Ids and delete them if they are older than 1 minute
  await Promise.all(
    storeIdsToDelete.map((storeId) => {
      const storeIdObjectId = new ObjectId(storeId)

      const objectAge = Date.now() - storeIdObjectId.getTimestamp().getTime()

      if (objectAge > 60 * 1000) {
        // Dekete the object and catch any errors
        return bucket.delete(storeIdObjectId).catch(() => {})
      }
    })
  )
}
