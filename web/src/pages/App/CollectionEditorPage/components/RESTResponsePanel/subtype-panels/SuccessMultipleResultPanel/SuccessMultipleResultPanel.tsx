/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types/src'
import { Skeleton } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { GlobeTestIcon } from 'src/components/utils/GlobeTestIcon'
import { useYJSModule } from 'src/contexts/imports'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { parseMessage } from 'src/globe-test/execution'
import { useYMap } from 'src/lib/zustand-yjs'
import { retrieveScopedResource } from 'src/store'

import { PanelLayout } from '../../../PanelLayout'
import { ExecutionPanel } from '../../ExecutionPanel'
import { FocusedRequestPanel } from '../../FocusedRequestPanel/FocusedRequestPanel'

type SuccessMultipleResultPanelProps = {
  focusedResponse: YMap<any>
}

export type MetricsList = (GlobeTestMessage & {
  orchestratorId: string
} & {
  messageType: 'METRICS'
  message: Record<string, unknown>
})[]

export const SuccessMultipleResultPanel = ({
  focusedResponse,
}: SuccessMultipleResultPanelProps) => {
  const Y = useYJSModule()

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const focusedResponseHook = useYMap(focusedResponse ?? new Y.Map())

  const [fetching, setFetching] = useState(false)

  const [storedGlobeTestLogs, setStoredGlobeTestLogs] = useState<
    GlobeTestMessage[] | null
  >(null)
  const [storedMetrics, setStoredMetrics] = useState<MetricsList[] | null>(null)

  const updateData = async ({
    globeTestLogsStoreReceipt,
    metricsStoreReceipt,
  }: {
    globeTestLogsStoreReceipt: string
    metricsStoreReceipt: string
  }) => {
    if (!scopeId || !rawBearer) {
      throw new Error('No scopeId or rawBearer')
    }

    const globeTestLogsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: globeTestLogsStoreReceipt,
    })

    const metricsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: metricsStoreReceipt,
    })

    const [globeTestLogsResult, metricsResult] = await Promise.all([
      globeTestLogsPromise,
      metricsPromise,
    ])

    setStoredGlobeTestLogs(
      (globeTestLogsResult.data ?? []).map((log: string) => parseMessage(log))
    )

    setStoredMetrics(
      (metricsResult.data ?? []).map((log: string) => parseMessage(log))
    )
  }

  const globeTestLogsStoreReceipt = useMemo(
    () =>
      focusedResponse?.get('globeTestLogs')?.storeReceipt as string | undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseHook]
  )

  const metricsStoreReceipt = useMemo(
    () => focusedResponse?.get('metrics')?.storeReceipt as string | undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseHook]
  )

  useEffect(() => {
    if (fetching) {
      return
    }

    if (
      !focusedResponse ||
      !globeTestLogsStoreReceipt ||
      !metricsStoreReceipt
    ) {
      return
    }

    setFetching(true)

    updateData({
      globeTestLogsStoreReceipt,
      metricsStoreReceipt,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponseHook, globeTestLogsStoreReceipt, metricsStoreReceipt])

  return (
    <PanelLayout
      tabNames={['Execution', 'Request']}
      tabIcons={[
        {
          name: 'Execution',
          icon: <GlobeTestIcon />,
        },
      ]}
      activeTabIndex={activeTabIndex}
      setActiveTabIndex={setActiveTabIndex}
      actionArea={actionArea}
    >
      {activeTabIndex === 0 &&
        (storedGlobeTestLogs && storedMetrics !== null ? (
          <ExecutionPanel
            setActionArea={setActionArea}
            globeTestLogs={storedGlobeTestLogs}
            metrics={storedMetrics}
            source={focusedResponse?.get('source')}
            sourceName={focusedResponse?.get('sourceName')}
          />
        ) : (
          <Skeleton />
        ))}
      {activeTabIndex === 1 && (
        <FocusedRequestPanel
          setActionArea={setActionArea}
          request={focusedResponse.get('underlyingRequest')}
          finalEndpoint={focusedResponse.get('endpoint')}
        />
      )}
    </PanelLayout>
  )
}
