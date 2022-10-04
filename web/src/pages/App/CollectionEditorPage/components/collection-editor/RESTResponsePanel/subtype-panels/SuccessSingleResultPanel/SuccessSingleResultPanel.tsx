/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types'
import { Box, Skeleton } from '@mui/material'
import { Response, ResponseCookie } from 'k6/http'
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
import { FocusedResponsePanel } from '../../FocusedResponsePanel/FocusedResponsePanel'

import { QuickSuccessSingleStats } from './QuickSuccessSingleStats'

type SuccessSingleResultPanelProps = {
  focusedResponse: YMap<any>
}

type MetricsList = (GlobeTestMessage & {
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
      globeTestLogsResult.data.map((log: string) => parseMessage(log))
    )

    setStoredMetrics(metricsResult.data ?? [])

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

  useEffect(() => {
    if (fetching) {
      return
    }

    const globeTestLogsStoreReceipt =
      focusedResponse?.get('globeTestLogs')?.storeReceipt
    const responseStoreReceipt = focusedResponse?.get('response')?.storeReceipt
    const metricsStoreReceipt = focusedResponse?.get('metrics')?.storeReceipt

    if (
      globeTestLogsStoreReceipt &&
      responseStoreReceipt &&
      metricsStoreReceipt
    ) {
      setStoredResponse(null)
      setStoredGlobeTestLogs(null)
      setStoredMetrics(null)
      setFetching(true)

      updateData({
        globeTestLogsStoreReceipt,
        responseStoreReceipt,
        metricsStoreReceipt,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponseHook])

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
    [focusedResponseHook]
  )

  return (
    <PanelLayout
      tabNames={['Response', 'Execution', 'Request']}
      tabIcons={[
        {
          name: 'Execution',
          icon: <GlobeTestIcon />,
        },
      ]}
      activeTabIndex={activeTabIndex}
      setActiveTabIndex={setActiveTabIndex}
      actionArea={actionArea}
      aboveTabsArea={
        <Box
          sx={{
            maxHeight: '18.38px',
            minHeight: '18.38px',
          }}
        >
          {singleStats ? (
            <QuickSuccessSingleStats
              statusCode={singleStats.statusCode}
              responseTimeMilliseconds={singleStats.responseDuration}
              responseSizeBytes={singleStats.responseSize}
            />
          ) : (
            <Skeleton />
          )}
        </Box>
      }
    >
      {activeTabIndex === 0 &&
        (storedResponse ? (
          <FocusedResponsePanel
            storedResponse={storedResponse}
            mappedHeaders={mappedHeaders}
            setActionArea={setActionArea}
            cookies={mappedCookies}
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
