import { getSubscribeRedis } from '../redis'

import { openDocs } from './connection-provider'
import { mongoPersistence } from './persistence-provider'

const handleDeletion = async (
  variant: 'USER' | 'TEAM',
  variantTargetId: string
) => {
  const existingOpenDoc = openDocs.get(`${variant}:${variantTargetId}`)

  if (existingOpenDoc) {
    existingOpenDoc.publishDeletion()

    await new Promise((resolve) => setTimeout(resolve, 500))
    await existingOpenDoc.closeDoc()
  }

  await mongoPersistence.clearDocument(`${variant}:${variantTargetId}`)
}

export const registerDeleteHandlers = async () => {
  const coreCacheSubscribeRedis = await getSubscribeRedis()

  coreCacheSubscribeRedis.subscribe('TEAM_DELETED', (teamId) =>
    handleDeletion('TEAM', teamId)
  )
  coreCacheSubscribeRedis.subscribe('USER_DELETED', (userId) =>
    handleDeletion('USER', userId)
  )
}
