/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

import type { ConsoleMessage, Threshold } from '@apiteam/datapeak'
import type { Socket } from 'socket.io-client'
import type { Map as YMap } from 'yjs'

import { SendingRequestAnimation } from 'src/components/app/utils/SendingRequestAnimation'
import { useDatapeakModule } from 'src/contexts/imports/datapeak-provider'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { streamExistingTest } from 'src/test-manager/executors'

import { PanelLayout } from '../../../../PanelLayout'
import { FocusedRequestPanel } from '../../tabs/FocusedRequestPanel/FocusedRequestPanel'
import { MetricsList } from '../SuccessSingleResultPanel'

type LoadingSingleResponsePanelProps = {
  focusedResponse: YMap<any>
}

export const LoadingSingleResponsePanel = ({
  focusedResponse,
}: LoadingSingleResponsePanelProps) => {
  const datapeakModule = useDatapeakModule()

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  const focusedResponseHook = useYMap(focusedResponse)

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const [metrics, setMetrics] = useState<MetricsList[]>([])
  const [globeTestLogs, setGlobeTestLogs] = useState<GlobeTestMessage[]>([])

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([])
  const [thresholds, setThresholds] = useState<Threshold[]>([])

  const jobId = useMemo(
    () => focusedResponse.get('jobId') as string,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseHook]
  )

  useEffect(() => {
    if (!rawBearer || !scopeId || !jobId) {
      return
    }

    const testInfoId = datapeakModule.initTestData()

    const consoleMessagesPoller = new datapeakModule.ConsoleMessagesPoller(
      testInfoId,
      setConsoleMessages
    )

    const thresholdsPoller = new datapeakModule.ThresholdsPoller(
      testInfoId,
      setThresholds
    )

    const newSocket = streamExistingTest({
      jobId,
      scopeId,
      rawBearer,
      onMessage: (message) => {
        if (
          message.messageType === 'INTERVAL' ||
          message.messageType === 'CONSOLE'
        ) {
          datapeakModule.addStreamedData(
            testInfoId,
            Buffer.from(message.message, 'base64')
          )
        }
      },
      executionAgent:
        focusedResponse.get('executionAgent') === 'Local' ? 'Local' : 'Cloud',
    })

    return () => {
      newSocket.disconnect()
      consoleMessagesPoller.destroy()
      thresholdsPoller.destroy()
      datapeakModule.deleteTestData(testInfoId)
    }

    return

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, rawBearer, scopeId])

  const tabNames = useMemo(
    () =>
      focusedResponse.get('__typename') === 'RESTResponse'
        ? ['Execution', 'Request']
        : ['Execution'],
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
      >
        {/* {activeTabIndex === 0 && (
          <ExecutionPanel
            setActionArea={setActionArea}
            globeTestLogs={globeTestLogs}
            metrics={metrics}
            source={focusedResponse.get('source') as string}
            sourceName={focusedResponse.get('sourceName') as string}
            responseId={focusedResponse.get('id') as string}
          />
        )} */}
        {tabNames.includes('Request') && activeTabIndex === 1 && (
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
