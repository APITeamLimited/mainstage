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
