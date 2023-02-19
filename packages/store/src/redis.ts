import { createClient } from 'redis'

import { checkValue } from './config'

const coreCacheUsername = checkValue<string>('coreCache.redis.userName')
const coreCachePassword = checkValue<string>('coreCache.redis.password')
const coreCacheHost = checkValue<string>('coreCache.redis.host')
const coreCachePort = checkValue<number>('coreCache.redis.port')

type RedisClient = ReturnType<typeof createClient>

let coreCacheReadRedis: RedisClient | null = null
let coreCacheSubscribeRedis: RedisClient | null = null

const connectClient = async () => {
  const client = createClient({
    url: `redis://${coreCacheUsername}:${coreCachePassword}@${coreCacheHost}:${coreCachePort}`,
  })

  await client.connect()

  return client
}

export const getReadRedis = async (): Promise<RedisClient> => {
  if (!coreCacheReadRedis) {
    coreCacheReadRedis = await connectClient()
  }

  return coreCacheReadRedis
}

export const getSubscribeRedis = async (): Promise<RedisClient> => {
  if (!coreCacheSubscribeRedis) {
    coreCacheSubscribeRedis = await connectClient()
  }

  return coreCacheSubscribeRedis
}
