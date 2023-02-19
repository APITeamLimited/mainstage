import type { ExecutionParams } from './execution-params'
import { GlobeTestMessage, JobUserUpdateMessage } from './test-manager'

export const LOCAL_AGENT_PORT = 59125
export const LOCAL_AGENT_MAX_JOBS = 5

export type LocalTestManagerClientMessage =
  | {
      type: 'abortJob'
      message: string // jobId
    }
  | {
      type: 'abortAllJobs'
    }
  | {
      type: 'newJob'
      message: ExecutionParams
    }
  | {
      type: 'jobUpdate'
      message: WrappedJobUserUpdate
    }

export type WrappedJobUserUpdate = {
  jobId: string
  update: JobUserUpdateMessage
}

// Server relays some messages back when successful

export type LocalTestManagerServerMessage =
  | {
      type: 'newJob'
      message: ExecutionParams
    }
  | {
      type: 'globeTestMessage'
      message: GlobeTestMessage
    }
  | {
      type: 'runningJobs'
      message: ExecutionParams[]
    }
  | {
      type: 'displayableErrorMessage'
      message: string
    }
  | {
      type: 'displayableSuccessMessage'
      message: string
    }
  | {
      type: 'jobDeleted'
      message: string // jobId
    }
