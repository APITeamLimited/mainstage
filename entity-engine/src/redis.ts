import { createClient } from 'redis'

import { checkValue } from './config'

const scopesUsername = checkValue<string>('scopes.redis.userName')
const scopesPassword = checkValue<string>('scopes.redis.password')
const scopesHost = checkValue<string>('scopes.redis.host')
const scopesPort = checkValue<number>('scopes.redis.port')

const scopesReadRedis = createClient({
  url: `redis://${scopesUsername}:${scopesPassword}@${scopesHost}:${scopesPort}`,
})

const scopesSubscribeRedis = scopesReadRedis.duplicate()

scopesReadRedis.connect()
scopesSubscribeRedis.connect()

export { scopesReadRedis, scopesSubscribeRedis }

const eeRedisUsername = checkValue<string>('entity-engine.redis.userName')
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
