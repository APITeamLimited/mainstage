import { GlobeTestOptions } from '@apiteam/types'
import { Response as K6Response } from 'k6/http'
import { Socket } from 'socket.io'
import type { Socket as EntityEngineSocket } from 'socket.io-client'

// Store state of running tests
export const runningTestStates = new Map<Socket, RunningTestState>()

export type RunningTestState =
  | {
      jobId?: string
      entityEngineSocket?: EntityEngineSocket
      testInfoStoreReceipt?: string
      options?: GlobeTestOptions

      // To handle concurrent messages, response creation request may be sent,
      // however, response may not be created yet. This acknowledges incoming
      // messages that creation request has been sent
      responseExistence: 'none' | 'creating' | 'created'
      localCompleted?: boolean
    } & (
      | {
          testType: 'undetermined'
        }
      | {
          testType: 'RESTRequest'
          markedResponse?: K6Response
          responseId?: string
        }
      | {
          testType: 'Folder'
          responseId?: string
        }
      | {
          testType: 'Collection'
          responseId?: string
        }
    )
