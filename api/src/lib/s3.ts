import { S3 } from 'aws-sdk'

import { checkValue } from 'src/config'
// Connect to external s3 provider

export const s3 = new S3({
  endpoint: checkValue<string>('api.s3.endpoint'),
  accessKeyId: checkValue<string>('api.s3.accessKeyId'),
  secretAccessKey: checkValue<string>('api.s3.secretAccessKey'),
  s3ForcePathStyle: true,
})

export const getOrCreateBucket = async (bucketName: string) => {
  // Create a bucket if it doesn't exist

  const bucketsList = await s3.listBuckets().promise()

  const exists = bucketsList.Buckets?.some(
    (bucket) => bucket.Name === bucketName
  )

  if (!exists) {
    await s3
      .createBucket({
        Bucket: bucketName,
      })
      .promise()
  }
}

export const getFileMetadata = async (
  bucketName: string,
  key: string
): Promise<S3.HeadObjectOutput | null> =>
  new Promise<S3.HeadObjectOutput | null>((resolve, reject) =>
    s3.headObject(
      {
        Bucket: bucketName,
        Key: key,
      },
      (err, data) => {
        if (err) {
          if (err.code === 'NotFound') {
            resolve(null)
          } else {
            reject(err)
          }
        } else {
          resolve(data)
        }
      }
    )
  )

export const deleteFile = async (
  bucketName: string,
  key: string
): Promise<void> => {
  await s3
    .deleteObject({
      Bucket: bucketName,
      Key: key,
    })
    .promise()
}
