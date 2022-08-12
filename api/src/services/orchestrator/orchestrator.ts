import { v4 as uuid } from 'uuid'

import { validateWith } from '@redwoodjs/api'

import { orchestratorReadRedis } from 'src/lib/redis'

export const newJob = async (source: string, sourceName: string) => {
  validateWith(async () => {
    if (!context.currentUser) {
      throw 'You must be logged in to access this resource.'
    }
  })

  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const newJob = {
    id: uuid(),
    source,
    sourceName,
    status: 'PENDING',
    options: {},
  }

  await Promise.all(
    Object.entries(orchestratorReadRedis).map(([key, value]) =>
      orchestratorReadRedis.hSet(newJob.id, key, value)
    )
  )
  await orchestratorReadRedis.publish('orchestrator:execution', newJob.id)
  await orchestratorReadRedis.sAdd('orchestrator:executionHistory', newJob.id)

  return newJob
}
