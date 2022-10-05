import { useEffect, useMemo, useRef, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types'
import type { Socket } from 'socket.io-client'
import type { Map as YMap } from 'yjs'

import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { streamExistingTest } from 'src/globe-test/existing-test'
import { useYMap } from 'src/lib/zustand-yjs'

import { ExecutionPanel } from './ExecutionPanel'

type LiveExecutionPanelProps = {
  focusedResponse: YMap<any>
  setActionArea: (actionArea: React.ReactNode) => void
}

export const LiveExecutionPanel = ({
  focusedResponse,
  setActionArea,
}: LiveExecutionPanelProps) => {
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const responseHook = useYMap(focusedResponse)
  const globeTestLogs = useRef<GlobeTestMessage[]>([])
  const metrics = useRef<GlobeTestMessage[]>([])

  const [testSocket, setTestSocket] = useState<Socket | null>(null)
  const [oldJobId, setOldJobId] = useState<string | null>(null)

  const jobId = useMemo(() => {
    return focusedResponse.get('jobId') as string
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responseHook])

  useEffect(() => {
    if (!rawBearer || !scopeId || !jobId) {
      return
      throw new Error('No rawBearer or scopeId or jobId')
    }

    if (jobId === oldJobId) {
      return
    }

    if (testSocket) {
      testSocket.disconnect()
      globeTestLogs.current = []
      metrics.current = []
    }

    const newSocket = streamExistingTest({
      jobId,
      scopeId,
      rawBearer,
      onMessage: (message) => {
        if (message.messageType === 'METRICS') {
          metrics.current.push(message)
        } else {
          globeTestLogs.current.push(message)
        }
      },
    })

    setTestSocket(newSocket)
    setOldJobId(jobId)

    return () => {
      console.log('Disconnecting socket')
      newSocket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, rawBearer, scopeId])

  return (
    <ExecutionPanel
      source={focusedResponse.get('source') as string}
      setActionArea={setActionArea}
      globeTestLogs={globeTestLogs.current}
      metrics={metrics.current}
    />
  )
}
