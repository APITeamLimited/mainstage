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
} from '@apiteam/types/src'
import { io, Socket } from 'socket.io-client'
import type { Doc as YDoc } from 'yjs'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { FocusedElementDictionary } from 'src/contexts/reactives'

import {
  getTestManagerURL,
  handleRESTAutoFocus,
  testManagerWrappedQuery,
} from '../utils'

import { processGlobeTestMessage } from './message-processing'

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

export type Upload = {
  jobId: string
  socket: Socket | null
  queue: GlobeTestMessage[]
  wrappedExecutionParams: WrappedExecutionParams
  storedGlobeTestLogs?: boolean
  storedMetrics?: boolean
  terminationMessage?: GlobeTestMessage
  storedOptions?: boolean
  // Multiple simultaneous uploads can happen so we need to keep track of the total number of uploads
  uploadCount: number
}

export type TerminationMessage = GlobeTestMessage & {
  message: 'COMPLETED_SUCCESS' | 'COMPLETED_FAILURE'
}

type LocalTestManagerConstructorArgs = {
  onManagerUpdate: (update: LocalManagerInterface) => void
  rawBearer: string | null
  scopeId: string | null
  focusedResponseDict: FocusedElementDictionary
  workspace: YDoc
}

export class LocalTestManager {
  socket!: WebSocket
  onManagerUpdate: (update: LocalManagerInterface) => void
  managerInterface: LocalManagerInterface = null
  connectInterval: NodeJS.Timer
  uploads: Upload[] = []
  wasOpen = false
  spawnTime: number = new Date().getTime()
  rawBearer: string | null
  scopeId: string | null
  focusedResponseDict: FocusedElementDictionary
  workspace: YDoc

  constructor({
    onManagerUpdate,
    rawBearer,
    scopeId,
    focusedResponseDict,
    workspace,
  }: LocalTestManagerConstructorArgs) {
    this.onManagerUpdate = onManagerUpdate
    this.rawBearer = rawBearer
    this.scopeId = scopeId
    this.focusedResponseDict = focusedResponseDict
    this.workspace = workspace

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
        snackSuccessMessageVar('Connected to APITeam Agent')
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
            uploadCount: 0,
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

    const uploadSocket = io(getTestManagerURL(), {
      query: testManagerWrappedQuery(
        upload.wrappedExecutionParams,
        '/new-local-test'
      ),
      path: '/api/test-manager',
      reconnection: false,
    })

    uploadSocket.on('connect', () => {
      // FInd the upload with this job id and send the queued messages

      if (upload) {
        upload.socket = uploadSocket
        upload.queue.forEach((message) =>
          uploadSocket.emit('globeTestMessage', message)
        )

        upload.queue = []
      } else {
        throw new Error('Could not find upload for already running job')
      }
    })

    uploadSocket.on('disconnect', () => {
      // Remove the upload with this job id
      this.uploads = this.uploads.filter((upload) => upload.jobId !== job.id)
    })

    uploadSocket.on('error', (error) => {
      snackErrorMessageVar('An error occurred while uploading the test result')
      console.log('Upload socket error', error)
    })

    handleRESTAutoFocus(
      this.focusedResponseDict,
      this.workspace,
      uploadSocket,
      upload.wrappedExecutionParams
    )

    upload.socket = uploadSocket
  }

  setScopeId(scopeId: string | null) {
    this.scopeId = scopeId
  }

  setRawBearer(rawBearer: string | null) {
    this.rawBearer = rawBearer
  }

  setFocusedResponseDict(focusedResponseDict: FocusedElementDictionary) {
    this.focusedResponseDict = focusedResponseDict
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
    processGlobeTestMessage(parsedMessage, manager)
  } else if (parsedMessage.type === 'displayableErrorMessage') {
    snackErrorMessageVar(parsedMessage.message)
  } else if (parsedMessage.type === 'displayableSuccessMessage') {
    snackSuccessMessageVar(parsedMessage.message)
  } else if (parsedMessage.type === 'jobDeleted') {
    // If upload exists, close it
    const upload = manager.uploads.find(
      (upload) => upload.jobId === parsedMessage.message
    )

    // Necessary for end of test lag
    if (upload && upload.socket) {
      setTimeout(() => {
        if (upload.socket) {
          upload.socket.disconnect()
        }
      }, 10000)
    }

    // Find the job and remove it
    manager.updateManagerValues({
      runningTests: (manager.managerInterface?.runningTests || []).filter(
        (test) => test.jobId !== parsedMessage.message
      ),
    })
  }
}
