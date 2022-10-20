/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types/src'
import { makeVar, useReactiveVar } from '@apollo/client'
import type { Socket } from 'socket.io-client'
import type { Map as YMap } from 'yjs'

import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { parseMessage } from 'src/globe-test/execution'
import { streamExistingTest } from 'src/globe-test/existing-test'
import { useYMap } from 'src/lib/zustand-yjs'

import { ExecutionPanel } from './ExecutionPanel'

// Use reactive var to ensure only one socket is created in the whole app at
// once
const existingTestSocketVar = makeVar<Socket | null>(null)

type LiveExecutionPanelProps = {
  focusedResponse: YMap<any>
  setActionArea: (actionArea: React.ReactNode) => void
}

export const LiveExecutionPanel = ({
  focusedResponse,
  setActionArea,
}: LiveExecutionPanelProps) => {
  const existingTestSocket = useReactiveVar(existingTestSocketVar)

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const responseHook = useYMap(focusedResponse)

  const [metrics, setMetrics] = useState<GlobeTestMessage[]>([])
  const [globeTestLogs, setGlobeTestLogs] = useState<GlobeTestMessage[]>([])

  const [testSocket, setTestSocket] = useState<Socket | null>(null)
  const [oldJobId, setOldJobId] = useState<string | null>(null)

  const jobId = useMemo(() => {
    return focusedResponse.get('jobId') as string
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseHook])

  const globeTestLogsBuffer = useRef<GlobeTestMessage[]>([])
  const metricsBuffer = useRef<GlobeTestMessage[]>([])

  useEffect(() => {
    // Every second, flush the buffers into the state
    const interval = setInterval(() => {
      setGlobeTestLogs(globeTestLogsBuffer.current)
      setMetrics(metricsBuffer.current)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!rawBearer || !scopeId || !jobId) {
      return
      throw new Error('No rawBearer or scopeId or jobId')
    }

    if (jobId === oldJobId) {
      return
    }

    // Disconnect any rouge old sockets

    if (existingTestSocket) {
      existingTestSocket.disconnect()
    }

    if (testSocket) {
      testSocket.disconnect()
      setGlobeTestLogs([])
      setMetrics([])
    }

    const newSocket = streamExistingTest({
      jobId,
      scopeId,
      rawBearer,
      onMessage: (message) => {
        if (message.messageType === 'METRICS') {
          metricsBuffer.current.push(message)
        } else {
          globeTestLogsBuffer.current.push(message)
        }
      },
    })

    setTestSocket(newSocket)
    setOldJobId(jobId)
    existingTestSocketVar(newSocket)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, rawBearer, scopeId])

  return (
    <ExecutionPanel
      setActionArea={setActionArea}
      globeTestLogs={globeTestLogs}
      metrics={metrics}
      source={focusedResponse.get('source') as string}
      sourceName={focusedResponse.get('sourceName') as string}
    />
  )
}
