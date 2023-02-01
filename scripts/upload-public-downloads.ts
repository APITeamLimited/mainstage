import * as fs from 'fs/promises'

import { AGENT_FILENAMES } from '@apiteam/types'
import { s3 } from 'api/src/lib/s3'

export default async () => {
  // Check is dev
  if (process.env.NODE_ENV !== 'development') {
    throw new Error(
      `Can only upload files in development currently in ${process.env.NODE_ENV}`
    )
  }

  // Ensure files exist in scripts/public-downloads

  const files = Object.values(AGENT_FILENAMES)

  for (const file of files) {
    try {
      await fs.access(`scripts/public-downloads/${file}`)
    } catch (error) {
      throw new Error(`File not found: ${file}`)
    }
  }

  console.log('Uploading files to S3...')

  for (const file of files) {
    console.log(`Uploading ${file}...`)
    await s3
      .upload({
        Bucket: 'public-downloads',
        Key: file,
        Body: await fs.readFile(`scripts/public-downloads/${file}`),
      })
      .promise()
  }

  console.log('Done!')
}
