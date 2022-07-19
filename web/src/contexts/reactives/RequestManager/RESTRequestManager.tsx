import { useCallback, useEffect, useState } from 'react'

import { makeVar, useReactiveVar } from '@apollo/client'
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { v4 as uuid } from 'uuid'

import {
  findEnvironmentVariables,
  findEnvironmentVariablesKeyValueItem,
} from 'src/utils/findVariables'

import { activeEnvironmentVar } from '../ActiveEnvironment'
import { localEnvironmentsVar, LocalRESTRequest } from '../locals'

type PendingRequest = {
  jobStatus: 'pending'
}

type ExecutingRequest = {
  jobStatus: 'executing'
  executionStartedAt: Date
  finalRequest: AxiosRequestConfig
}

type RESTQueuedJob = {
  id: string
  messenger: 'Browser'
  request: LocalRESTRequest
  createdAt: Date
} & (PendingRequest | ExecutingRequest)

const restRequestQueueInitial: RESTQueuedJob[] = []

export const restRequestQueueVar = makeVar(restRequestQueueInitial)

export const addToQueue = ({
  queue,
  request,
  messenger = 'Browser',
}: {
  queue: RESTQueuedJob[]
  request: LocalRESTRequest
  messenger?: 'Browser'
}) => {
  const newJob: RESTQueuedJob = {
    id: uuid(),
    messenger,
    request,
    createdAt: new Date(),
    jobStatus: 'pending',
  }

  return [...queue, newJob]
}

export const RESTRequestManager = () => {
  // Access to local data required for finding final request
  const localEnvironments = useReactiveVar(localEnvironmentsVar)
  const activeEnvironmentId = useReactiveVar(activeEnvironmentVar)
  const [activeEnvironment, setActiveEnvironment] = useState(
    localEnvironments.find((e) => e.id === activeEnvironmentId) || null
  )

  useEffect(() => {
    setActiveEnvironment(
      localEnvironments.find((e) => e.id === activeEnvironmentId) || null
    )
  }, [localEnvironments, activeEnvironmentId])

  const queue = useReactiveVar(restRequestQueueVar)

  // Utility function to update job by id
  const updateFilterQueue = useCallback(
    (oldQueue: RESTQueuedJob[], updatedJobs: RESTQueuedJob[]) => {
      const idArray = updatedJobs.map((job) => job.id)
      // Filter queues to see if job id in updatedJobs
      const newQueue = oldQueue.filter((job) => !idArray.includes(job.id))
      return [...newQueue, ...updatedJobs]
    },
    []
  )

  const handleRequestResponse = useCallback(
    (response: AxiosResponse<any, any>) => {
      console.log('handleRequestResponse', response)
    },
    []
  )

  const getFinalRequest = useCallback(
    (request: LocalRESTRequest): AxiosRequestConfig => {
      const finalHeaders = request.headers
        .map((header) =>
          findEnvironmentVariablesKeyValueItem(activeEnvironment, header)
        )
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})

      const finalParameters = request.params
        .map((param) =>
          findEnvironmentVariablesKeyValueItem(activeEnvironment, param)
        )
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})

      const finalEndpoint = findEnvironmentVariables(
        activeEnvironment,
        request.endpoint
      )

      return {
        method: request.method,
        url: finalEndpoint,
        headers: finalHeaders,
        params: finalParameters,
        signal: new AbortController().signal,
      }
    },
    [activeEnvironment]
  )

  // Scan for pending requests and start executing them
  useEffect(() => {
    const updatedJobs: RESTQueuedJob[] = []

    queue.forEach((job) => {
      if (job.jobStatus === 'pending') {
        console.log('executing job', job)
        const finalRESTRequest = getFinalRequest(job.request)

        const updatedJob: RESTQueuedJob = {
          ...job,
          jobStatus: 'executing',
          executionStartedAt: new Date(),
          finalRequest: finalRESTRequest,
        }

        axios(finalRESTRequest).then(handleRequestResponse)

        updatedJobs.push(updatedJob)
      }
    })

    if (updatedJobs.length > 0) {
      restRequestQueueVar(updateFilterQueue(queue, updatedJobs))
    }
  }, [getFinalRequest, handleRequestResponse, queue, updateFilterQueue])

  return <></>
}
