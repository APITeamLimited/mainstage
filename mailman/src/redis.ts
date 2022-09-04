import { createClient } from 'redis'

import { checkValue } from './config'

const mailmanUsername = checkValue<string>('mailman.redis.userName')
const mailmanPassword = checkValue<string>('mailman.redis.password')
export const mailmanRedisHost = checkValue<string>('mailman.redis.host')
export const mailmanRedisPort = checkValue<number>('mailman.redis.port')

const mailmanReadRedis = createClient({
  url: `redis://${mailmanUsername}:${mailmanPassword}@${mailmanRedisHost}:${mailmanRedisPort}`,
})

const mailmanSubscribeRedis = mailmanReadRedis.duplicate()

mailmanReadRedis.connect()
mailmanSubscribeRedis.connect()

export { mailmanReadRedis, mailmanSubscribeRedis }

export const awaitConnection = async () => {
  // Try set and get a value to check if redis is running, if not wait 1 second and try again
  try {
    await mailmanReadRedis.set('test', 'test')
    return
  } catch (error) {
    console.log('Failed to connect to redis, retrying in 1 second')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await awaitConnection()
  }
}
