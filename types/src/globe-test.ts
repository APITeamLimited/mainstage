type ClientType =
  | {
      orchestratorClient: string
    }
  | {
      workerClient: string
    }

export type StatusType =
  | 'PENDING'
  | 'ASSIGNED'
  | 'LOADING'
  | 'RUNNING'
  | 'FAILED'
  | 'SUCCESS'

export type TagType = {
  tag: string
  value: Record<string, unknown>
}

type MessageCombination =
  | {
      messageType: 'MESSAGE'
      message: string
    }
  | {
      messageType: 'CONSOLE'
      message: Record<string, unknown>
    }
  | {
      messageType: 'STATUS'
      message: StatusType
    }
  | {
      messageType: 'RESULTS'
      message: Record<string, unknown>
    }
  | {
      messageType: 'ERROR'
      message: string
    }
  | {
      messageType: 'DEBUG'
      message: string
    }
  | {
      messageType: 'TAG'
      message: TagType
    }

export type GlobeTestMessage = {
  jobId: string
  time: number
} & ClientType &
  MessageCombination
