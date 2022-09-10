import { resolve } from 'path'

import { createClient } from 'redis'

import { checkValue } from './config'
import { deleteTeam, deleteUser } from './yjs/delete-handlers'

const coreCacheUsername = checkValue<string>('coreCache.redis.userName')
const coreCachePassword = checkValue<string>('coreCache.redis.password')
const coreCacheHost = checkValue<string>('coreCache.redis.host')
const coreCachePort = checkValue<number>('coreCache.redis.port')

const coreCacheReadRedis = createClient({
  url: `redis://${coreCacheUsername}:${coreCachePassword}@${coreCacheHost}:${coreCachePort}`,
})

const coreCacheSubscribeRedis = coreCacheReadRedis.duplicate()

coreCacheReadRedis.connect()
coreCacheSubscribeRedis.connect()

export { coreCacheReadRedis, coreCacheSubscribeRedis }

// Handle deletion
const setupDeletion = async () => {
  // Sleep for 5 seconds to allow redis to connect
  await new Promise((resolve) => setTimeout(resolve, 5000))

  coreCacheSubscribeRedis.subscribe('TEAM_DELETED', deleteTeam)
  coreCacheSubscribeRedis.subscribe('USER_DELETED', deleteUser)
}

setupDeletion()

export const eeRedisUsername = checkValue<string>(
  'entity-engine.redis.userName'
)
export const eeRedisPassword = checkValue<string>(
  'entity-engine.redis.password'
)
export const eeRedisHost = checkValue<string>('entity-engine.redis.host')
export const eeRedisPort = checkValue<number>('entity-engine.redis.port')

const eeReadRedis = createClient({
  url: `redis://${eeRedisUsername}:${eeRedisPassword}@${eeRedisHost}:${eeRedisPort}`,
})

const eeSubscribeRedis = eeReadRedis.duplicate()

eeReadRedis.connect()
eeSubscribeRedis.connect()

export { eeReadRedis, eeSubscribeRedis }
