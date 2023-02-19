import { GridFSBucket } from 'mongodb'

import { mongoDB } from '../../mongo'
import { getSubscribeRedis } from '../../redis'

const handleDeletion = async (
  variant: 'USER' | 'TEAM',
  variantTargetId: string
) => {
  const bucket = new GridFSBucket(mongoDB, {
    bucketName: `${variant}:${variantTargetId}`,
  })

  await bucket.drop().catch(() => {})
}

export const registerDeleteHandlers = async () => {
  const subscribeRedis = await getSubscribeRedis()

  subscribeRedis.subscribe('TEAM_DELETED', (teamId) =>
    handleDeletion('TEAM', teamId)
  )
  subscribeRedis.subscribe('USER_DELETED', (userId) =>
    handleDeletion('USER', userId)
  )
}
