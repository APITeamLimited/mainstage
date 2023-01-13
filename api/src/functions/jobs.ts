import { Queue, Worker } from 'bullmq'

import { checkValue } from 'src/config'
import {
  applyFreeCredits,
  registerRecurringCreditsJob,
} from 'src/jobs/apply-free-credits'

export const jobsRedisUsername = checkValue<string>('jobs-redis.userName')
export const jobsRedisPassword = checkValue<string>('jobs-redis.password')
export const jobsRedisHost = checkValue<string>('jobs-redis.host')
export const jobsRedisPort = checkValue<number>('jobs-redis.port')

const connection = {
  host: jobsRedisHost,
  port: jobsRedisPort,
  username: jobsRedisUsername,
  password: jobsRedisPassword,
}

export const apiQueue = new Queue('api', {
  connection,
})

// Register recurring jobs
registerRecurringCreditsJob(apiQueue).catch((err) => {
  console.log(err)
})

const worker = new Worker(
  'api',
  async (job) => {
    if (job.name === 'applyFreeCredits') {
      applyFreeCredits().catch((err) => {
        console.log(err)
      })
    }
  },
  {
    connection,
  }
)

console.log('API jobs worker started')

// Listen for node close events and close worker gracefully
process.on('exit', async () => {
  await worker.close()
  process.exit(0)
})
