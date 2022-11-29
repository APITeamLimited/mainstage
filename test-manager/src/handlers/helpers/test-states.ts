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
      globeTestLogsStoreReceipt?: string
      metricsStoreReceipt?: string
      options?: GlobeTestOptions
      responseExistence: 'none' | 'creating' | 'created'
      localCompleted?: boolean
    } & (
      | {
          testType: 'rest'
          markedResponse?: K6Response
          responseId?: string
        }
      | {
          testType: 'undetermined'
        }
    )
