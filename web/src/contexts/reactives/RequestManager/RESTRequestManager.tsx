import { useCallback, useEffect, useRef, useState } from 'react'

import { makeVar, useReactiveVar } from '@apollo/client'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { v4 as uuid } from 'uuid'

import {
  findEnvironmentVariables,
  findEnvironmentVariablesKeyValueItem,
} from 'src/utils/findVariables'

import { activeEnvironmentVar } from '../ActiveEnvironment'
import {
  localEnvironmentsVar,
  LocalRESTRequest,
  LocalRESTResponse,
  localRESTResponsesVar,
} from '../locals'

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
  launchTime: Date | null
} & (PendingRequest | ExecutingRequest)

const restRequestQueueInitial: RESTQueuedJob[] = []

export const restRequestQueueVar = makeVar(restRequestQueueInitial)

// Utility function to update job by id
const updateFilterQueue = (
  oldQueue: RESTQueuedJob[],
  updatedJobs: RESTQueuedJob[]
) => {
  const idArray = updatedJobs.map((job) => job.id)
  // Filter queues to see if job id in updatedJobs
  const nonUpdatedJobs = oldQueue.filter((job) => !idArray.includes(job.id))
  return [...nonUpdatedJobs, ...updatedJobs]
}

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
    launchTime: null,
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
  const localRESTResponses = useReactiveVar(localRESTResponsesVar)
  const queueRef = useRef<RESTQueuedJob[] | null>(null)

  // Requried for up to date state in callback
  queueRef.current = useReactiveVar(restRequestQueueVar)

  useEffect(() => {
    setActiveEnvironment(
      localEnvironments.find((e) => e.id === activeEnvironmentId) || null
    )
  }, [localEnvironments, activeEnvironmentId])

  const queue = useReactiveVar(restRequestQueueVar)

  const handleRequestResponse = useCallback(
    (id: string, response: AxiosResponse) => {
      if (!queueRef.current) {
        throw `queueRef.current is null`
      }

      const arrivalTime = new Date()

      const originalJob = queueRef.current.find((job) => job.id === id)

      if (!originalJob) {
        throw `Could not find job with id ${id}, this is needed to save its associated response`
      }

      if (!originalJob.launchTime) {
        throw `Job with id ${id} has no launch time, this is needed to save its associated response`
      }

      const originalRequest = originalJob.request

      // Create REST response object
      const restResponse: LocalRESTResponse = {
        id: uuid(),
        __typename: 'LocalRESTResponse',
        createdAt: new Date(),
        updatedAt: null,
        parentId: originalRequest.id,
        __parentTypename: originalRequest.__typename,
        name: originalRequest.endpoint,
        type: 'Success',

        headers: Object.entries(response.headers).map(([key, value]) => ({
          key,
          value,
        })),

        body: response.data,
        statusCode: response.status,
        meta: {
          // Response duration is differnce between launchTime and arrivalTime
          responseDuration:
            arrivalTime.getTime() - new Date(originalJob.launchTime).getTime(),

          // Response size is size of headers + content-length header
          responseSize:
            (Number(response.headers?.['content-length']) || 0) +
            JSON.stringify(response.headers).length,
        },
        request: originalRequest,
      }

      // Remove request from queue
      const newQueue = queue.filter((job) => job.id !== id)
      restRequestQueueVar(newQueue)

      // Save response to LocalRESTResponses
      localRESTResponsesVar(
        [...localRESTResponses, restResponse].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      )
    },
    [queue, localRESTResponses]
  )

  const handleRequestError = useCallback((id: string, error: AxiosError) => {
    console.log('handleRequestError', error)
  }, [])

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
        const finalRESTRequest = getFinalRequest(job.request)

        const updatedJob: RESTQueuedJob = {
          ...job,
          jobStatus: 'executing',
          executionStartedAt: new Date(),
          finalRequest: finalRESTRequest,
          launchTime: new Date(),
        }
        updatedJobs.push(updatedJob)

        axios(finalRESTRequest)
          .then((response: AxiosResponse) =>
            handleRequestResponse(job.id, response)
          )
          .catch((error: AxiosError) => handleRequestError(job.id, error))
      }
    })

    if (updatedJobs.length > 0) {
      const newQueue = updateFilterQueue(queue, updatedJobs)
      restRequestQueueVar(newQueue)
    }
  }, [getFinalRequest, handleRequestError, handleRequestResponse, queue])

  return <></>
}
