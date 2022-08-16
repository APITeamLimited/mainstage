import { createClient } from 'redis'

import { checkValue } from './config'

const orchestratorUserName = checkValue<string>('orchestrator.redis.userName')
const orchestratorPassword = checkValue<string>('orchestrator.redis.password')
const orchestratorHost = checkValue<string>('orchestrator.redis.host')
const orchestratorPort = checkValue<number>('orchestrator.redis.port')

const orchestratorReadRedis = createClient({
  url: `redis://${orchestratorUserName}:${orchestratorPassword}@${orchestratorHost}:${orchestratorPort}`,
})

const orchestratorSubscribeRedis = orchestratorReadRedis.duplicate()

orchestratorReadRedis.connect()
orchestratorSubscribeRedis.connect()

export { orchestratorReadRedis, orchestratorSubscribeRedis }

const scopesUsername = checkValue<string>('scopes.redis.userName')
const scopesPassword = checkValue<string>('scopes.redis.password')
const scopesHost = checkValue<string>('scopes.redis.host')
const scopesPort = checkValue<number>('scopes.redis.port')

const scopesReadRedis = createClient({
  url: `redis://${scopesPassword}@${scopesHost}:${scopesPort}`,
})

const scopesSubscribeRedis = scopesReadRedis.duplicate()

scopesReadRedis.connect()
scopesSubscribeRedis.connect()

export { scopesReadRedis, scopesSubscribeRedis }
