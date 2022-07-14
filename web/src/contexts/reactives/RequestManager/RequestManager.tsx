import { useEffect } from 'react'

import { makeVar, useReactiveVar } from '@apollo/client'

import { LocalRESTRequest } from '../locals'

type RequestManagerQueuedJob = {
  messenger: 'Browser'
  request: LocalRESTRequest
  createdAt: number
}

type RequestManagerStatus = {
  queue: RequestManagerQueuedJob[]
  abortControllers: {
    requestId: string
    abortController: AbortController
  }[]
}

const requestManagerInitialStatus: RequestManagerStatus = {
  queue: [],
  abortControllers: [],
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
  return {
    queue: [...queue, { messenger: 'Browser', request, createdAt: Date.now() }],
  }
}

export const RequestManager = () => {
  const requestManagerStatus = useReactiveVar(requestManagerStatusVar)

  const addAbortController = (
    requestId: string,
    abortController: AbortController
  ) => {
    requestManagerStatusVar({
      ...requestManagerStatus,
      abortControllers: [
        ...requestManagerStatus.abortControllers,
        {
          requestId,
          abortController,
        },
      ],
    })
  }

  const removeAbortController = (requestId: string) => {
    requestManagerStatusVar({
      ...requestManagerStatus,
      abortControllers: requestManagerStatus.abortControllers.filter(
        (abortController) => abortController.requestId !== requestId
      ),
    })
  }

  const emptyQueue = () => {
    requestManagerStatusVar({
      ...requestManagerStatus,
      queue: [],
    })
  }

  useEffect(() => {
    requestManagerStatus.queue.forEach((item) => {
      if (item.request.__typename === 'LocalRESTRequest') {
        const controller = new AbortController()
        addAbortController(item.request.id, controller)
      } else {
        throw `RequestManager: Unsupported request type ${item.request.__typename}`
      }
    })

    emptyQueue()
  }, [requestManagerStatus.queue])

  return <></>
}
