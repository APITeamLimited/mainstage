import { useEffect } from 'react'

import { makeVar, useReactiveVar } from '@apollo/client'
import { v4 as uuid } from 'uuid'

import { LocalRESTRequest } from '../locals'

type PendingRequest = {
  jobStatus: 'pending'
}

type ExecutingRequest = {
  jobStatus: 'executing'
  executionStartedAt: Date
  abortController: AbortController
}

type RequestManagerQueuedJob = {
  id: string
  messenger: 'Browser'
  request: LocalRESTRequest
  createdAt: Date
} & (PendingRequest | ExecutingRequest)

type RequestManagerStatus = {
  queue: RequestManagerQueuedJob[]
}

const requestManagerInitialStatus: RequestManagerStatus = {
  queue: [],
}

export const requestManagerStatusVar = makeVar(requestManagerInitialStatus)

export const addToQueue = ({
  queue,
  request,
  messenger = 'Browser',
}: {
  queue: RequestManagerQueuedJob[]
  request: LocalRESTRequest
  messenger?: 'Browser'
}) => {
  const newJob: RequestManagerQueuedJob = {
    id: uuid(),
    messenger,
    request,
    createdAt: new Date(),
    jobStatus: 'pending',
  }

  return {
    queue: [...queue, newJob],
  }
}

export const RequestManager = () => {
  const requestManagerStatus = useReactiveVar(requestManagerStatusVar)
  const { queue } = requestManagerStatus

  // Utility function to update job by id
  const updateFilterQueue = (
    requestManagerStatus: RequestManagerStatus,
    updatedJobs: RequestManagerQueuedJob[]
  ) => {
    const idArray = updatedJobs.map((job) => job.id)
    // Filter queues to see if job id in updatedJobs
    const newQueue = queue.filter((job) => !idArray.includes(job.id))
    return {
      queue: [...newQueue, ...updatedJobs],
    }
  }

  // Scan for pending requests and start executing them
  useEffect(() => {
    const updatedJobs: RequestManagerQueuedJob[] = []
    queue.forEach((job) => {
      if (job.jobStatus === 'pending') {
        const updatedJob: RequestManagerQueuedJob = {
          ...job,
          jobStatus: 'executing',
          executionStartedAt: new Date(),
          abortController: new AbortController(),
        }

        updatedJobs.push(updatedJob)
      }
    })

    // Update filter queue with new jobs
    requestManagerStatusVar(
      updateFilterQueue(requestManagerStatus, updatedJobs)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue])

  return <></>
}

const createAxiosRequest = (request: LocalRESTRequest) => {
  const axiosInstance = axios.create({
    method: request.method,
    url: request.endpoint,
    headers: request.headers,
    timeout: 99999,
  })

  return axiosInstance
}
