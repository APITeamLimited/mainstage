import { createClient } from 'redis'

import { checkValue } from './config'

const coreCacheUsername = checkValue<string>('coreCache.redis.userName')
const coreCachePassword = checkValue<string>('coreCache.redis.password')
const coreCacheHost = checkValue<string>('coreCache.redis.host')
const coreCachePort = checkValue<number>('coreCache.redis.port')

const coreCacheReadRedis = createClient({
  url: `redis://${coreCacheUsername}:${coreCachePassword}@${coreCacheHost}:${coreCachePort}`,
})

coreCacheReadRedis.connect()

export { coreCacheReadRedis }
