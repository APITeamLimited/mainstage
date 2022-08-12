import { createClient } from 'redis'

import { checkValue } from './config'

const orchestratorUserName = checkValue<string>('orchestrator.redis.userName')
const orchestratorPassword = checkValue<string>('orchestrator.redis.password')
const orchestratorHost = checkValue<string>('orchestrator.redis.host')
const orchestratorPort = checkValue<number>('orchestrator.redis.port')

export const orchestratorReadRedis = createClient({
  url: `redis://${orchestratorUserName}:${orchestratorPassword}@${orchestratorHost}:${orchestratorPort}`,
})

export const orchestratorSubscribeRedis = orchestratorReadRedis.duplicate()

const scopesUsername = checkValue<string>('scopes.redis.userName')
const scopesPassword = checkValue<string>('scopes.redis.password')
const scopesHost = checkValue<string>('scopes.redis.host')
const scopesPort = checkValue<number>('scopes.redis.port')

export const scopesReadRedis = createClient({
  url: `redis://${scopesUsername}:${scopesPassword}@${scopesHost}:${scopesPort}`,
})

export const scopesSubscribeRedis = scopesReadRedis.duplicate()
