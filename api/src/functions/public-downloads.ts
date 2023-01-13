import type { APIGatewayProxyEvent } from 'aws-lambda'

import { getFileMetadata, s3, getOrCreateBucket } from '../lib/s3'

const publicDownloadsBucket = 'public-downloads' as const

export const handler = async (event: APIGatewayProxyEvent, _: never) => {
  const filename = event.queryStringParameters?.filename ?? null

  if (!filename) {
    return {
      statusCode: 400,
      body: 'filename must be provided in query parameters',
    }
  }

  // Check if filename exists

  const fileMetadata = await getFileMetadata(publicDownloadsBucket, filename)

  if (!fileMetadata) {
    return {
      statusCode: 404,
      body: 'File not found',
    }
  }

  // Generate signed url for file, this is one time use
  const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: publicDownloadsBucket,
    Key: filename,
    Expires: 60, // 1 minute
  })

  // Redirect to signed url
  return {
    statusCode: 302,
    headers: {
      Location: signedUrl,
    },
    body: '',
  }
}
