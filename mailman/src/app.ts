import { Color } from 'colorterm'
import { v4 as uuid } from 'uuid'

import { startDevServer } from './dev'
import { handleRenderRequest } from './executor'
import {
  awaitConnection,
  mailmanSubscribeRedis,
  mailmanRedisHost,
  mailmanRedisPort,
  mailmanReadRedis,
} from './redis'

process.title = 'mailman'

const workerId = uuid()

const MAX_CONCURRENT_JOBS = 50
let currentJobCount = 0

// Every minute print memory usage and number of connections
setInterval(() => {
  console.log(
    Color(
      `Memory: ${(process.memoryUsage().heapUsed / 1000 / 1000).toFixed(2)}MB`,
      '#4B0082'
    )
  )
}, 60000)

// Check if redis is running
const handleRenderRequests = async () => {
  await awaitConnection()

  console.log(
    Color(
      `\n\nAPITeam Mailman with worker id ${workerId} listening on redis at ${mailmanRedisHost}:${mailmanRedisPort}\n\n`,
      '#8F00FF'
    )
  )

  mailmanSubscribeRedis.subscribe('renderRequest', async (jobId) => {
    const jobInfo = await mailmanReadRedis.hGetAll(jobId)
    await checkIfCanExecute(jobInfo)
  })
}

export const checkIfCanExecute = async (jobInfo: { [x: string]: string }) => {
  if (!jobInfo.id) {
    await Promise.all([
      mailmanReadRedis.sRem('queuedRenderJobs', jobInfo.id),
      mailmanReadRedis.del(jobInfo.id),
    ])
    return
  }

  if (jobInfo.assignedId) {
    // Job is already assigned to another worker
    return
  }

  if (currentJobCount >= MAX_CONCURRENT_JOBS) {
    // Too many jobs already running
    return
  }

  const assignmentResult = await mailmanReadRedis.hSetNX(
    jobInfo.id,
    'assignedId',
    workerId
  )

  if (!assignmentResult) {
    // Job was already assigned to another worker
    return
  }

  // We got the job!
  currentJobCount++

  const removeQueuePromise = mailmanReadRedis.sRem(
    'queuedRenderJobs',
    jobInfo.id
  )
  const outputPromsise = await handleRenderRequest(JSON.parse(jobInfo.input))

  const [_, output] = await Promise.all([removeQueuePromise, outputPromsise])

  await Promise.all([
    mailmanReadRedis.hSet(jobInfo.id, 'output', JSON.stringify(output)),
    mailmanReadRedis.publish(
      `renderResponse:${jobInfo.id}`,
      JSON.stringify(output)
    ),
  ])

  currentJobCount--
}

const checkForPendingJobs = async () => {
  const queuedJobs = await mailmanReadRedis.SMEMBERS('queuedRenderJobs')

  const estimatedCount = MAX_CONCURRENT_JOBS - currentJobCount
  if (estimatedCount <= 0) return

  const jobsToAssign = queuedJobs.slice(0, estimatedCount)

  const jobInfos = await Promise.all(
    jobsToAssign.map((jobId) => mailmanReadRedis.hGetAll(jobId))
  )

  await Promise.all(jobInfos.map(async (jobInfo) => checkIfCanExecute(jobInfo)))
}

// Periodically check for pending jobs that may have been added while we were busy
setInterval(async () => await checkForPendingJobs(), 1000)

// Receive real time updates from the render queue
handleRenderRequests()

// If dev mode, fire up a test node server
if (process.env.NODE_ENV === 'development') {
  startDevServer()
}
