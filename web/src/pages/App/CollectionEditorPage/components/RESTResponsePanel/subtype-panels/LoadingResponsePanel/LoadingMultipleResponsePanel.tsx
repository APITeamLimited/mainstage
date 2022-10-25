/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

import type { GlobeTestMessage, MetricsCombination } from '@apiteam/types/src'
import { makeVar, useReactiveVar } from '@apollo/client'
import { Skeleton } from '@mui/material'
import type { Socket } from 'socket.io-client'
import type { Map as YMap } from 'yjs'

import { SendingRequestAnimation } from 'src/components/app/utils/SendingRequestAnimation'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { streamExistingTest } from 'src/globe-test/existing-test'
import { useYMap } from 'src/lib/zustand-yjs'

import { PanelLayout } from '../../../PanelLayout'
import { ExecutionPanel } from '../../ExecutionPanel'
import { FocusedRequestPanel } from '../../FocusedRequestPanel/FocusedRequestPanel'
import { LoadTestSummaryPanel } from '../../load-test-metrics/above-tabs-area/LoadTestSummaryPanel'
import { GraphsPanel } from '../../load-test-metrics/graphs/GraphsPanel'
import { MetricsList } from '../SuccessSingleResultPanel'

// Use reactive var to ensure only one socket is created in the whole app at once
const existingTestSocketVar = makeVar<Socket | null>(null)

type LoadingMultipleResponsePanelProps = {
  focusedResponse: YMap<any>
}

export const LoadingMultipleResponsePanel = ({
  focusedResponse,
}: LoadingMultipleResponsePanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  useYMap(focusedResponse)

  const existingTestSocket = useReactiveVar(existingTestSocketVar)

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const responseHook = useYMap(focusedResponse)

  const [metrics, setMetrics] = useState<MetricsList[]>([])
  const [globeTestLogs, setGlobeTestLogs] = useState<GlobeTestMessage[]>([])

  const [testSocket, setTestSocket] = useState<Socket | null>(null)
  const [oldJobId, setOldJobId] = useState<string | null>(null)

  const jobId = useMemo(
    () => focusedResponse.get('jobId') as string,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [responseHook]
  )

  const globeTestLogsBuffer = useRef<GlobeTestMessage[]>([])
  const metricsBuffer = useRef<MetricsList[]>([])

  useEffect(() => {
    // Every second, flush the buffers into the state
    const interval = setInterval(() => {
      setGlobeTestLogs(globeTestLogsBuffer.current)
      setMetrics(metricsBuffer.current)
    }, 1000)

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
          metricsBuffer.current.push(message as unknown as MetricsList)
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
    <>
      <SendingRequestAnimation />
      <PanelLayout
        tabNames={['Graphs', 'Execution', 'Request']}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
        aboveTabsArea={
          <LoadTestSummaryPanel
            key={`${metrics.length}-${focusedResponse.get('id')}`}
            metrics={
              metrics as unknown as
                | (GlobeTestMessage & MetricsCombination)[]
                | null
            }
            responseYMap={focusedResponse}
          />
        }
      >
        {activeTabIndex === 0 && (
          <GraphsPanel
            focusedResponse={focusedResponse}
            metrics={metrics as unknown as MetricsList | null}
          />
        )}
        {activeTabIndex === 1 && (
          <ExecutionPanel
            setActionArea={setActionArea}
            globeTestLogs={globeTestLogs}
            metrics={metrics}
            source={focusedResponse.get('source') as string}
            sourceName={focusedResponse.get('sourceName') as string}
          />
        )}
        {activeTabIndex === 2 && (
          <FocusedRequestPanel
            request={focusedResponse.get('underlyingRequest')}
            finalEndpoint={focusedResponse.get('endpoint')}
            setActionArea={setActionArea}
          />
        )}
      </PanelLayout>
    </>
  )
}
