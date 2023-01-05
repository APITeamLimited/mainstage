import { createClient } from 'redis'

import { checkValue } from 'src/config'

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

// const creditsUsername = checkValue<string>('credits.redis.userName')
// const creditsPassword = checkValue<string>('credits.redis.password')
// const creditsHost = checkValue<string>('credits.redis.host')
// const creditsPort = checkValue<number>('credits.redis.port')

// const creditsReadRedis = createClient({
//   url: `redis://${creditsUsername}:${creditsPassword}@${creditsHost}:${creditsPort}`,
// })

// const creditsSubscribeRedis = creditsReadRedis.duplicate()

// creditsReadRedis.connect()
// creditsSubscribeRedis.connect()

// export { creditsReadRedis, creditsSubscribeRedis }
