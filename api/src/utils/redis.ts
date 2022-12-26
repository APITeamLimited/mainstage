import type { RedisClientType } from '@redis/client'

type IdentifiableObjectType = {
  id: string
}

export const setModelRedis = async <T extends IdentifiableObjectType>(
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redisInstance: RedisClientType<any, any, any>,
  data: T | T[]
) => {
  if (Array.isArray(data)) {
    const records = data.reduce((acc, curr) => {
      acc[curr.id] = JSON.stringify(curr)
      return acc
    }, {} as Record<string, string>)

    await redisInstance.hSet(key, records)
  } else {
    await redisInstance.hSet(key, data.id, JSON.stringify(data))
  }
}

export const scanPatternDelete = async (
  pattern: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  redisInstance: RedisClientType<any, any, any>
) => {
  let keys: string[] = []

  for await (const key of redisInstance.scanIterator({
    MATCH: pattern,
    COUNT: 100,
  })) {
    keys.push(key)

    if (keys.length === 100) {
      await redisInstance.del(keys)
      keys = []
    }
  }
}
