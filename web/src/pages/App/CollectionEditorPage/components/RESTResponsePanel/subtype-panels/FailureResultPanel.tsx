/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types/src'
import { parseGlobeTestMessage } from '@apiteam/types/src'
import { Alert, Skeleton } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { useYJSModule } from 'src/contexts/imports'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { retrieveScopedResource } from 'src/store'

import { PanelLayout } from '../../PanelLayout'
import { ExecutionPanel } from '../ExecutionPanel'
import { FocusedRequestPanel } from '../FocusedRequestPanel/FocusedRequestPanel'

import { MetricsList } from './SuccessSingleResultPanel'

type FailureResultPanelProps = {
  focusedResponse: YMap<any>
}

export const FailureResultPanel = ({
  focusedResponse,
}: FailureResultPanelProps) => {
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
  const [storedMetrics, setStoredMetrics] = useState<
    MetricsList[] | null | 'NONE'
  >(null)

  const updateData = async ({
    globeTestLogsStoreReceipt,
    metricsStoreReceipt,
  }: {
    globeTestLogsStoreReceipt: string
    metricsStoreReceipt: string | null
  }) => {
    if (!scopeId || !rawBearer) {
      throw new Error('No scopeId or rawBearer')
    }

    let metricsPromise = new Promise((resolve) => resolve('NONE')) as Promise<
      | {
          data: any
          contentType: string
        }
      | 'NONE'
    >

    if (metricsStoreReceipt !== null) {
      metricsPromise = retrieveScopedResource({
        scopeId,
        rawBearer,
        storeReceipt: metricsStoreReceipt,
      })
    }

    const globeTestLogsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: globeTestLogsStoreReceipt,
    })

    const [metricsResult, globeTestLogsResult] = await Promise.all([
      metricsPromise,
      globeTestLogsPromise,
    ])

    if (metricsResult === 'NONE') {
      setStoredMetrics(metricsResult)
    } else {
      setStoredMetrics(
        (metricsResult.data ?? []).map((log: string) =>
          parseGlobeTestMessage(log)
        )
      )
    }

    setStoredGlobeTestLogs(
      (globeTestLogsResult.data ?? []).map((log: string) =>
        parseGlobeTestMessage(log)
      )
    )
  }

  useEffect(() => {
    if (fetching) {
      return
    }

    const globeTestLogsStoreReceipt =
      focusedResponse?.get('globeTestLogs')?.storeReceipt

    const metricsStoreReceipt =
      focusedResponse?.get('metrics')?.storeReceipt ?? (null as string | null)

    if (globeTestLogsStoreReceipt) {
      setStoredGlobeTestLogs(null)
      setFetching(true)

      updateData({
        globeTestLogsStoreReceipt,
        metricsStoreReceipt,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponseHook])

  const errorMessage = useMemo(() => {
    if (!storedGlobeTestLogs) {
      return 'Request failed to execute, please examine the logs for more info.'
    }

    // Find last message with messageType ERROR and find most recent
    const sortedErrors = storedGlobeTestLogs
      .filter((message) => message.messageType === 'ERROR')
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    if (
      sortedErrors.length === 0 ||
      typeof sortedErrors[0].message !== 'string'
    ) {
      return 'Request failed to execute, please examine the logs for more info.'
    }

    if (sortedErrors[0].message.length > 200) {
      return `${sortedErrors[0].message.slice(
        0,
        200
      )}... Message truncated, please examine the logs for more info.`
    }

    return sortedErrors[0].message as string
  }, [storedGlobeTestLogs])

  return (
    <PanelLayout
      tabNames={['Execution', 'Request']}
      activeTabIndex={activeTabIndex}
      setActiveTabIndex={setActiveTabIndex}
      actionArea={actionArea}
      aboveTabsArea={<Alert severity="error">{errorMessage}</Alert>}
    >
      {activeTabIndex === 0 &&
        (storedGlobeTestLogs !== null ? (
          <ExecutionPanel
            setActionArea={setActionArea}
            globeTestLogs={storedGlobeTestLogs}
            source={focusedResponse.get('source')}
            sourceName={focusedResponse.get('sourceName')}
            metrics={storedMetrics}
            responseId={focusedResponse.get('id')}
          />
        ) : (
          <Skeleton />
        ))}
      {activeTabIndex === 1 && (
        <FocusedRequestPanel
          request={focusedResponse.get('underlyingRequest')}
          finalEndpoint={focusedResponse.get('endpoint')}
          setActionArea={setActionArea}
        />
      )}
    </PanelLayout>
  )
}
