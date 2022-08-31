import { createClient } from 'redis'

import { checkValue } from './config'

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

/*const eeRedisUsername = checkValue<string>('entity-engine.redis.userName')
const eeRedisPassword = checkValue<string>('entity-engine.redis.password')
const eeRedisHost = checkValue<string>('entity-engine.redis.host')
const eeRedisPort = checkValue<number>('entity-engine.redis.port')

const eeReadRedis = createClient({
  url: `redis://${eeRedisUsername}:${eeRedisPassword}@${eeRedisHost}:${eeRedisPort}`,
})

const eeSubscribeRedis = eeReadRedis.duplicate()

eeReadRedis.connect()
eeSubscribeRedis.connect()

export { eeReadRedis, eeSubscribeRedis }
*/
