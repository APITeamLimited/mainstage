import { createClient } from 'redis'

import { checkValue } from './config'

export type RedisClient = ReturnType<typeof createClient>

const orchestratorUserName = checkValue<string>('orchestrator.redis.userName')
const orchestratorPassword = checkValue<string>('orchestrator.redis.password')
const orchestratorHost = checkValue<string>('orchestrator.redis.host')
const orchestratorPort = checkValue<number>('orchestrator.redis.port')

let orchestratorReadRedis: RedisClient | null = null
let orchestratorSubscribeRedis: RedisClient | null = null

const connectOrchestratorClient = async () => {
  const client = createClient({
    url: `redis://${orchestratorUserName}:${orchestratorPassword}@${orchestratorHost}:${orchestratorPort}`,
  })

  await client.connect()

  return client
}

export const getOrchestratorReadRedis = async (): Promise<RedisClient> => {
  if (!orchestratorReadRedis) {
    orchestratorReadRedis = await connectOrchestratorClient()
  }

  return orchestratorReadRedis
}

export const getOrchestratorSubscribeRedis = async (): Promise<RedisClient> => {
  if (!orchestratorSubscribeRedis) {
    orchestratorSubscribeRedis = await connectOrchestratorClient()
  }

  return orchestratorSubscribeRedis
}

const coreCacheUsername = checkValue<string>('coreCache.redis.userName')
const coreCachePassword = checkValue<string>('coreCache.redis.password')
const coreCacheHost = checkValue<string>('coreCache.redis.host')
const coreCachePort = checkValue<number>('coreCache.redis.port')

let coreCacheReadRedis: RedisClient | null = null
let coreCacheSubscribeRedis: RedisClient | null = null

const connectCoreCacheClient = async () => {
  const client = createClient({
    url: `redis://${coreCacheUsername}:${coreCachePassword}@${coreCacheHost}:${coreCachePort}`,
  })

  await client.connect()

  return client
}

export const getCoreCacheReadRedis = async (): Promise<RedisClient> => {
  if (!coreCacheReadRedis) {
    coreCacheReadRedis = await connectCoreCacheClient()
  }

  return coreCacheReadRedis
}

export const getCoreCacheSubscribeRedis = async (): Promise<RedisClient> => {
  if (!coreCacheSubscribeRedis) {
    coreCacheSubscribeRedis = await connectCoreCacheClient()
  }

  return coreCacheSubscribeRedis
}

const creditsUsername = checkValue<string>('credits-redis.userName')
const creditsPassword = checkValue<string>('credits-redis.password')
const creditsHost = checkValue<string>('credits-redis.host')
const creditsPort = checkValue<number>('credits-redis.port')

let creditsReadRedis: RedisClient | null = null
let creditsSubscribeRedis: RedisClient | null = null

const connectCreditsClient = async () => {
  const client = createClient({
    url: `redis://${creditsUsername}:${creditsPassword}@${creditsHost}:${creditsPort}`,
  })

  await client.connect()

  return client
}

export const getCreditsReadRedis = async (): Promise<RedisClient> => {
  if (!creditsReadRedis) {
    creditsReadRedis = await connectCreditsClient()
  }

  return creditsReadRedis
}

export const getCreditsSubscribeRedis = async (): Promise<RedisClient> => {
  if (!creditsSubscribeRedis) {
    creditsSubscribeRedis = await connectCreditsClient()
  }

  return creditsSubscribeRedis
}
