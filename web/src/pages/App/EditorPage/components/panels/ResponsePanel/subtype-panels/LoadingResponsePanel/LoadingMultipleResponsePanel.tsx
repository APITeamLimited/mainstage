/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

import type { GlobeTestMessage, MetricsCombination } from '@apiteam/types/src'
import type { Socket } from 'socket.io-client'
import type { Map as YMap } from 'yjs'

import { SendingRequestAnimation } from 'src/components/app/utils/SendingRequestAnimation'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { streamExistingTest } from 'src/test-manager/executors'

import { PanelLayout } from '../../../../PanelLayout'
import { ExecutionPanel } from '../../ExecutionPanel'
import { FocusedRequestPanel } from '../../FocusedRequestPanel/FocusedRequestPanel'
import { LoadTestSummaryPanel } from '../../load-test-metrics/above-tabs-area/LoadTestSummaryPanel'
import { GraphsPanel } from '../../load-test-metrics/graphs/GraphsPanel'
import { MetricsList } from '../SuccessSingleResultPanel'

type LoadingMultipleResponsePanelProps = {
  focusedResponse: YMap<any>
}

export const LoadingMultipleResponsePanel = ({
  focusedResponse,
}: LoadingMultipleResponsePanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  useYMap(focusedResponse)

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const focusedResponseHook = useYMap(focusedResponse)

  const [metrics, setMetrics] = useState<MetricsList[]>([])
  const [globeTestLogs, setGlobeTestLogs] = useState<GlobeTestMessage[]>([])

  const [testSocket, setTestSocket] = useState<Socket | null>(null)
  const [oldJobId, setOldJobId] = useState<string | null>(null)

  const jobId = useMemo(
    () => focusedResponse.get('jobId') as string,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseHook]
  )

  const globeTestLogsBuffer = useRef<GlobeTestMessage[]>([])
  const metricsBuffer = useRef<MetricsList[]>([])

  useEffect(() => {
    // Every second, flush the buffers into the state
    const interval = setInterval(() => {
      setGlobeTestLogs([...globeTestLogsBuffer.current])
      setMetrics([...metricsBuffer.current])
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!rawBearer || !scopeId || !jobId) {
      return
    }

    if (jobId === oldJobId) {
      return
    }

    if (testSocket) {
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
      executionAgent:
        focusedResponse.get('executionAgent') === 'Local' ? 'Local' : 'Cloud',
    })

    setTestSocket(newSocket)
    setOldJobId(jobId)

    // This seems to be causing some issues
    // return () => {
    //   newSocket.close()
    // }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, rawBearer, scopeId])

  useEffect(() => {
    if (activeTabIndex === 0) {
      setActionArea(null)
    }
  }, [activeTabIndex])

  const wasLimited = useMemo(
    () =>
      globeTestLogs?.find(
        (log) =>
          log.messageType === 'MESSAGE' &&
          log.message === 'UNVERIFIED_DOMAIN_THROTTLED'
      ) !== undefined
        ? true
        : // eslint-disable-next-line react-hooks/exhaustive-deps
          false,
    [globeTestLogs]
  )

  const logsThrottled = useMemo(
    () =>
      globeTestLogs?.find(
        (log) =>
          log.messageType === 'MESSAGE' &&
          log.message === 'MAX_CONSOLE_LOGS_REACHED'
      ) !== undefined
        ? true
        : // eslint-disable-next-line react-hooks/exhaustive-deps
          false,
    [globeTestLogs]
  )

  const tabNames = useMemo(
    () =>
      focusedResponse.get('__typename') === 'RESTResponse'
        ? ['Graphs', 'Execution', 'Request']
        : ['Graphs', 'Execution'],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseHook]
  )

  return (
    <>
      <SendingRequestAnimation />
      <PanelLayout
        tabNames={tabNames}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
        aboveTabsArea={
          <LoadTestSummaryPanel
            metrics={
              metrics as unknown as
                | (GlobeTestMessage & MetricsCombination)[]
                | null
            }
            responseYMap={focusedResponse}
            wasLimited={wasLimited}
            logsThrottled={logsThrottled}
            errorMessage={null}
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
            responseId={focusedResponse.get('id') as string}
          />
        )}
        {tabNames.includes('Request') && activeTabIndex === 2 && (
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
