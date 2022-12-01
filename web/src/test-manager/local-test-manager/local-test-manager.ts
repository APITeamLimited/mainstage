import {
  JobUserUpdateMessage,
  RunningTestInfo,
  LOCAL_AGENT_PORT,
  ExecutionParams,
  LocalTestManagerClientMessage,
  LocalTestManagerServerMessage,
  StatusType,
  Optional,
  GlobeTestMessage,
  WrappedExecutionParams,
  parseGlobeTestMessage,
} from '@apiteam/types/src'
import { io, Socket } from 'socket.io-client'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'

import { getTestManagerURL, testManagerWrappedQuery } from '../utils'

export type LocalManagerInterface = {
  abortJob: (jobId: string) => void
  abortAllJobs: () => void
  submitNewJob: (
    executionParams: ExecutionParams,
    wrappedExecutionParams: WrappedExecutionParams
  ) => void
  sendJobUpdate: (jobId: string, update: JobUserUpdateMessage) => void
  runningTests: RunningTestInfo[]
} | null

type Upload = {
  jobId: string
  socket: Socket | null
  queue: GlobeTestMessage[]
  wrappedExecutionParams: WrappedExecutionParams
  storedGlobeTestLogs?: boolean
  storedMetrics?: boolean
}

type LocalTestManagerConstructorArgs = {
  onManagerUpdate: (update: LocalManagerInterface) => void
}

export class LocalTestManager {
  socket!: WebSocket
  onManagerUpdate: (update: LocalManagerInterface) => void
  managerInterface: LocalManagerInterface = null
  connectInterval: NodeJS.Timer
  uploads: Upload[] = []
  wasOpen = false
  spawnTime: number = new Date().getTime()

  constructor({ onManagerUpdate }: LocalTestManagerConstructorArgs) {
    this.onManagerUpdate = onManagerUpdate

    this.setupSocket()

    this.connectInterval = setInterval(() => {
      if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
        this.setupSocket()
      }
    }, 5000)
  }

  setupSocket() {
    this.socket = new WebSocket(`ws://localhost:${LOCAL_AGENT_PORT}/agent`)
    this.socket.onmessage = (event) => processSocketMessage(event, this)
    this.socket.onclose = () => this.updateManagerValues(null)

    this.socket.onopen = () => {
      // Show success message if spawn time more than 5 seconds ago
      if (new Date().getTime() - this.spawnTime > 5000) {
        snackSuccessMessageVar('Connected to localhost agent')
      }

      this.wasOpen = true

      const newValues: LocalManagerInterface = {
        abortJob: (jobId: string) => {
          this.socket.send(
            JSON.stringify({
              type: 'abortJob',
              message: jobId,
            } as LocalTestManagerClientMessage)
          )
        },
        abortAllJobs: () => {
          this.socket.send(
            JSON.stringify({
              type: 'abortAllJobs',
            } as LocalTestManagerClientMessage)
          )
        },
        submitNewJob: (executionParams, wrappedExecutionParams) => {
          const upload: Upload = {
            jobId: executionParams.id,
            socket: null,
            queue: [],
            wrappedExecutionParams,
          }

          this.uploads.push(upload)

          this.socket.send(
            JSON.stringify({
              type: 'newJob',
              message: executionParams,
            } as LocalTestManagerClientMessage)
          )

          // This must be called after pushing to uploads
          this.createUploadSocket(executionParams)
        },
        sendJobUpdate: (jobId: string, update: JobUserUpdateMessage) => {
          this.socket.send(
            JSON.stringify({
              type: 'jobUpdate',
              message: {
                jobId,
                update,
              },
            } as LocalTestManagerClientMessage)
          )
        },
        runningTests: [],
      }

      this.updateManagerValues(newValues)
    }

    this.socket.onclose = () => {
      if (this.wasOpen) {
        snackErrorMessageVar('Disconnected from localhost agent')
        this.wasOpen = false
      }

      this.uploads.forEach((upload) => {
        if (upload.socket) {
          upload.socket.close()
        }
      })

      this.uploads = []

      this.updateManagerValues(null)
    }
  }

  updateManagerValues(updatedValues: Optional<LocalManagerInterface> | null) {
    if (updatedValues === null) {
      this.managerInterface = null
    } else {
      // Filter to not undefined values
      this.managerInterface = {
        ...this.managerInterface,
        ...updatedValues,
      } as LocalManagerInterface
    }

    this.onManagerUpdate(this.managerInterface)
  }

  updateJobStatus(jobId: string, status: StatusType) {
    if (this.managerInterface) {
      const runningTests = this.managerInterface.runningTests.map((test) => {
        if (test.jobId === jobId) {
          return {
            ...test,
            status,
          }
        }

        return test
      })

      this.updateManagerValues({
        runningTests,
      })
    }
  }

  destroy() {
    this.socket.close()
  }

  createUploadSocket(job: ExecutionParams) {
    const upload = this.uploads.find((upload) => upload.jobId === job.id)
    if (!upload) {
      throw new Error('Could not find upload for already running job')
    }

    const socket = io(getTestManagerURL(), {
      query: testManagerWrappedQuery(
        upload.wrappedExecutionParams,
        '/new-local-test'
      ),
      path: '/api/test-manager',
      reconnection: false,
    })

    socket.on('connect', () => {
      // FInd the upload with this job id and send the queued messages

      if (upload) {
        upload.socket = socket
        upload.queue.forEach((message) =>
          socket.emit('globeTestMessage', message)
        )

        upload.queue = []
      } else {
        throw new Error('Could not find upload for already running job')
      }
    })

    socket.on('disconnect', () => {
      // Remove the upload with this job id
      this.uploads = this.uploads.filter((upload) => upload.jobId !== job.id)
    })

    socket.on('error', (error) => {
      snackErrorMessageVar('An error occurred while uploading the test result')
      console.log('Upload socket error', error)
    })

    upload.socket = socket
  }

  addToUploadQueue(message: GlobeTestMessage) {
    // Find upload
    const upload = this.uploads.find((upload) => upload.jobId === message.jobId)

    const parseResult = parseGlobeTestMessage(message)

    if (!upload) {
      throw new Error('Could not find upload for already running job')
    }

    if (upload.socket && upload.socket.connected) {
      upload.socket.emit('globeTestMessage', message)
    } else {
      upload.queue.push(message)
    }
  }
}

const processSocketMessage = (
  event: MessageEvent<string>,
  manager: LocalTestManager
) => {
  const parsedMessage = JSON.parse(event.data) as LocalTestManagerServerMessage

  if (parsedMessage.type === 'runningJobs') {
    const runningJobs = parsedMessage.message

    manager.updateManagerValues({
      runningTests: runningJobs.map((job) => ({
        jobId: job.id,
        sourceName: job.sourceName,
        createdByUserId: job.scope.userId,
        createdAt: job.createdAt,
        status: 'ASSIGNED',
      })),
    })
  } else if (parsedMessage.type === 'newJob') {
    const job = parsedMessage.message

    manager.updateManagerValues({
      runningTests: [
        ...(manager.managerInterface?.runningTests || []),
        {
          jobId: job.id,
          sourceName: job.sourceName,
          createdByUserId: job.scope.userId,
          createdAt: job.createdAt,
          status: 'ASSIGNED',
        },
      ],
    })
  } else if (parsedMessage.type === 'globeTestMessage') {
    parsedMessage.message = parseGlobeTestMessage(parsedMessage.message)

    if (parsedMessage.message.messageType === 'STATUS') {
      console.log('Status message', parsedMessage.message)

      manager.updateJobStatus(
        parsedMessage.message.jobId,
        parsedMessage.message.message
      )
    } else if (parsedMessage.message.messageType === 'MARK') {
      manager.addToUploadQueue(parsedMessage.message)
    }

    // TODO handle uplaod here

    manager.addToUploadQueue(parsedMessage.message)
  } else if (parsedMessage.type === 'displayableErrorMessage') {
    snackErrorMessageVar(parsedMessage.message)
  } else if (parsedMessage.type === 'displayableSuccessMessage') {
    snackSuccessMessageVar(parsedMessage.message)
  } else if (parsedMessage.type === 'jobDeleted') {
    // Find the job and remove it
    manager.updateManagerValues({
      runningTests: (manager.managerInterface?.runningTests || []).filter(
        (test) => test.jobId !== parsedMessage.message
      ),
    })
  }
}
