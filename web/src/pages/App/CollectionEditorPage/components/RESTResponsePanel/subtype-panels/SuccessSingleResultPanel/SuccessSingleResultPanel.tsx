/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { GlobeTestMessage, parseGlobeTestMessage } from '@apiteam/types/src'
import { Skeleton } from '@mui/material'
import { Response, ResponseCookie } from 'k6/http'
import type { Map as YMap } from 'yjs'

import { useYJSModule } from 'src/contexts/imports'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { useYMap } from 'src/lib/zustand-yjs'
import { retrieveScopedResource } from 'src/store'

import { PanelLayout } from '../../../PanelLayout'
import { StatsSkeleton } from '../../../stats'
import { ExecutionPanel } from '../../ExecutionPanel'
import { FocusedRequestPanel } from '../../FocusedRequestPanel/FocusedRequestPanel'
import { FocusedResponsePanel } from '../../FocusedResponsePanel/FocusedResponsePanel'

import { QuickSuccessSingleStats } from './QuickSuccessSingleStats'

type SuccessSingleResultPanelProps = {
  focusedResponse: YMap<any>
}

export type MetricsList = (GlobeTestMessage & {
  orchestratorId: string
} & {
  messageType: 'METRICS'
  message: Record<string, unknown>
})[]

export const SuccessSingleResultPanel = ({
  focusedResponse,
}: SuccessSingleResultPanelProps) => {
  const Y = useYJSModule()

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const focusedResponseHook = useYMap(focusedResponse ?? new Y.Map())

  const [fetching, setFetching] = useState(false)

  const [storedResponse, setStoredResponse] = useState<Response | null>(null)
  const [storedGlobeTestLogs, setStoredGlobeTestLogs] = useState<
    GlobeTestMessage[] | null
  >(null)
  const [storedMetrics, setStoredMetrics] = useState<MetricsList[] | null>(null)
  const [mappedCookies, setMappedCookies] = useState<ResponseCookie[]>([])
  const [mappedHeaders, setMappedHeaders] = useState<
    {
      key: string
      value: string
    }[]
  >([])

  const updateData = async ({
    globeTestLogsStoreReceipt,
    metricsStoreReceipt,
    responseStoreReceipt,
  }: {
    globeTestLogsStoreReceipt: string
    metricsStoreReceipt: string
    responseStoreReceipt: string
  }) => {
    if (!scopeId || !rawBearer) {
      throw new Error('No scopeId or rawBearer')
    }

    const globeTestLogsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: globeTestLogsStoreReceipt,
    })

    const responsePromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: responseStoreReceipt,
    })

    const metricsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: metricsStoreReceipt,
    })

    const [globeTestLogsResult, responseResult, metricsResult] =
      await Promise.all([globeTestLogsPromise, responsePromise, metricsPromise])

    setStoredResponse(responseResult.data)
    setStoredGlobeTestLogs(
      (globeTestLogsResult.data ?? []).map((log: string) =>
        parseGlobeTestMessage(log)
      )
    )

    setStoredMetrics(
      (metricsResult.data ?? []).map((log: string) =>
        parseGlobeTestMessage(log)
      )
    )

    setMappedCookies(
      Object.values(
        (responseResult.data.request as Response | null)?.cookies ?? []
      ).flat()
    )

    setMappedHeaders(
      Object.entries((responseResult.data as Response | null)?.headers ?? {})
        .map(([key, value]) => ({
          key,
          value,
        }))
        .flat()
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

  const responseStoreReceipt = useMemo(
    () => focusedResponse?.get('response')?.storeReceipt as string | undefined,
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
      !responseStoreReceipt ||
      !metricsStoreReceipt
    ) {
      return
    }

    setFetching(true)

    updateData({
      globeTestLogsStoreReceipt,
      responseStoreReceipt,
      metricsStoreReceipt,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    focusedResponseHook,
    globeTestLogsStoreReceipt,
    responseStoreReceipt,
    metricsStoreReceipt,
  ])

  const singleStats = useMemo(
    () => {
      const statusCode = focusedResponse.get('statusCode')
      const responseDuration = focusedResponse?.get('meta')?.responseDuration
      const responseSize = focusedResponse?.get('meta')?.responseSize

      if (!statusCode || !responseDuration || !responseSize) {
        return null
      }

      return {
        statusCode,
        responseDuration,
        responseSize,
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseHook, fetching]
  )

  return (
    <PanelLayout
      tabNames={['Response', 'Execution', 'Request']}
      activeTabIndex={activeTabIndex}
      setActiveTabIndex={setActiveTabIndex}
      actionArea={actionArea}
      aboveTabsArea={
        singleStats ? (
          <QuickSuccessSingleStats
            statusCode={singleStats.statusCode}
            responseTimeMilliseconds={singleStats.responseDuration}
            responseSizeBytes={singleStats.responseSize}
          />
        ) : (
          <StatsSkeleton count={3} />
        )
      }
    >
      {activeTabIndex === 0 &&
        (storedResponse ? (
          <FocusedResponsePanel
            storedResponse={storedResponse}
            mappedHeaders={mappedHeaders}
            setActionArea={setActionArea}
            cookies={mappedCookies}
            responseId={focusedResponse.get('id')}
          />
        ) : (
          <Skeleton />
        ))}
      {activeTabIndex === 1 &&
        (storedGlobeTestLogs && storedMetrics !== null ? (
          <ExecutionPanel
            setActionArea={setActionArea}
            globeTestLogs={storedGlobeTestLogs}
            metrics={storedMetrics}
            source={focusedResponse?.get('source')}
            sourceName={focusedResponse?.get('sourceName')}
            responseId={focusedResponse?.get('id')}
          />
        ) : (
          <Skeleton />
        ))}
      {activeTabIndex === 2 &&
        (storedResponse ? (
          <FocusedRequestPanel
            setActionArea={setActionArea}
            request={focusedResponse.get('underlyingRequest')}
            finalEndpoint={focusedResponse.get('endpoint')}
          />
        ) : (
          <Skeleton />
        ))}
    </PanelLayout>
  )
}
