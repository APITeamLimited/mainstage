/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import type { ConsoleMessage, Threshold } from '@apiteam/datapeak'
import type { GlobeTestMessage } from '@apiteam/types'
import { Skeleton } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { SendingRequestAnimation } from 'src/components/app/utils/SendingRequestAnimation'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { useDatapeakCurrentTest } from 'src/pages/App/EditorPage/hooks'

import { PanelLayout } from '../../../../PanelLayout'
import { SkeletonLoadingPanel } from '../../../SkeletonLoadingPanel'
import {
  ExecutionPanel,
  GraphsPanel,
  LoadTestSummaryPanel,
  ScriptPanel,
} from '../../tabs'
import { ConsolePanel } from '../../tabs/ConsolePanel'
import { FocusedRequestPanel } from '../../tabs/FocusedRequestPanel/FocusedRequestPanel'
import { MetricsList } from '../SuccessSingleResultPanel'

type LoadingMultipleResponsePanelProps = {
  focusedResponse: YMap<any>
}

export const LoadingMultipleResponsePanel = ({
  focusedResponse,
}: LoadingMultipleResponsePanelProps) => {
  const focusedResponseHook = useYMap(focusedResponse)

  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  useEffect(() => {
    if (activeTabIndex === 0) {
      setActionArea(null)
    }
  }, [activeTabIndex])

  const { onUnmount, testInfoId, notices } = useDatapeakCurrentTest(
    scopeId,
    rawBearer,
    focusedResponse,
    {
      onSummaryUpdates: (summary) => console.log('summary', summary),
      onThresholds: (thresholds) => console.log('thresholds', thresholds),
    }
  )

  useEffect(() => onUnmount, [onUnmount])

  const tabNames = useMemo(
    () =>
      focusedResponse.get('__typename') === 'RESTResponse'
        ? ['Graphs', 'Console', 'Script', 'Request']
        : ['Graphs', 'Console', 'Script'],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseHook]
  )

  if (!testInfoId) {
    return <SkeletonLoadingPanel />
  }
  return (
    <>
      <SendingRequestAnimation />
      <PanelLayout
        tabNames={tabNames}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
        aboveTabsArea={
          <></>
          // <LoadTestSummaryPanel
          //   metrics={metrics as unknown as GlobeTestMessage[] | null}
          //   responseYMap={focusedResponse}
          //   unverifiedDomainThrottled={notices.unverifiedDomainThrottled}
          //   consoleLogsLimited={notices.consoleLogsLimited}
          //   outputsLimited={notices.outputsLimited}
          //   // Don't show error message if the test is still running as test will be terminated
          //   errorMessage={null}
          // />
        }
      >
        {/* {activeTabIndex === 0 && (
          <GraphsPanel
            focusedResponse={focusedResponse}
            metrics={metrics as unknown as MetricsList | null}
          />
        )} */}
        {activeTabIndex === 1 && (
          <ConsolePanel setActionArea={setActionArea} testInfoId={testInfoId} />
        )}
        {activeTabIndex === 2 && (
          <ScriptPanel
            setActionArea={setActionArea}
            source={focusedResponse.get('source')}
            sourceName={focusedResponse.get('sourceName')}
            namespace={`${focusedResponse.get('id')}responsescript`}
          />
        )}
        {tabNames.includes('Request') && activeTabIndex === 3 && (
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
