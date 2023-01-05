import { Worker } from 'bullmq'

import { checkValue } from 'src/config'

export const jobsRedisUsername = checkValue<string>('api.jobs-redis.userName')
export const jobsRedisPassword = checkValue<string>('api.jobs-redis.password')
export const jobsRedisHost = checkValue<string>('api.jobs-redis.host')
export const jobsRedisPort = checkValue<number>('api.jobs-redis.port')

const worker = new Worker('api', async (job) => {}, {
  connection: {
    host: jobsRedisHost,
    port: jobsRedisPort,
    username: jobsRedisUsername,
    password: jobsRedisPassword,
  },
})

// Listen for node close events and close worker gracefully
process.on('exit', async () => {
  await worker.close()
  process.exit(0)
})
