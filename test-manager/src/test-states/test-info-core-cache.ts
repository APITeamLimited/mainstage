import { RunningTestInfo, StatusType } from '@apiteam/types'

import { getCoreCacheReadRedis } from '../lib/redis'

export const updateTestInfoCoreCache = async (
  jobId: string,
  status: StatusType,
  runningTestKey: string
) => {
  const coreCacheReadRedis = await getCoreCacheReadRedis()

  // Delete test info if completed
  if (status === 'COMPLETED_SUCCESS' || status === 'COMPLETED_FAILURE') {
    console.log('Delete 1')
    await coreCacheReadRedis.hDel(runningTestKey, jobId)
    return
  }

  const testInfo = await coreCacheReadRedis.hGet(runningTestKey, jobId)
  if (!testInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Test info not found')
    }
    return
  }

  const parsedTestInfo = JSON.parse(testInfo) as RunningTestInfo

  await coreCacheReadRedis.hSet(
    runningTestKey,
    jobId,
    JSON.stringify({
      ...parsedTestInfo,
      status,
    })
  )
}
