/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { DefaultMetrics, GlobeTestMessage } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import { Box, Skeleton } from '@mui/material'
import { Response, ResponseCookie } from 'k6/http'
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'zustand-yjs'

import { KeyValueResultsTable } from 'src/components/app/utils/KeyValueResultsTable'
import { GlobeTestIcon } from 'src/components/utils/GlobeTestIcon'
import { useYJSModule } from 'src/contexts/imports'
import { getFocusedElementKey } from 'src/contexts/reactives'
import { useWorkspace } from 'src/entity-engine'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { parseMessage } from 'src/globe-test/execution'
import { useCollection } from 'src/pages/App/CollectionEditorPage'
import { retrieveScopedResource } from 'src/store'

import { focusedResponseVar } from '../..'
import { PanelLayout } from '../../../PanelLayout'
import { BodyPanel } from '../../BodyPanel'
import { CookieTable } from '../../CookieTable'
import { ExecutionPanel } from '../../ExecutionPanel'
import { UnderlyingRequestPanel } from '../../UnderlyingRequestPanel'

import { QuickSuccessSingleStats } from './QuickSuccessSingleStats'

type SuccessSingleResultPanelProps = {
  requestYMap: YMap<any>
}

export const SuccessSingleResultPanel = ({
  requestYMap,
}: SuccessSingleResultPanelProps) => {
  const Y = useYJSModule()

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  const workspace = useWorkspace()
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const collectionYMap = useCollection()
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const collectionHook = useYMap(collectionYMap ?? new Y.Map())
  useYMap(requestYMap ?? new Y.Map())

  const focusedResponse = useMemo(
    () =>
      focusedResponseDict[getFocusedElementKey(collectionYMap ?? new Y.Map())],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseDict, collectionHook]
  )

  const [storedResponse, setStoredResponse] = useState<Response | null>(null)

  const [storedGlobeTestLogs, setStoredGlobeTestLogs] = useState<
    GlobeTestMessage[] | null
  >(null)

  const [storedMetrics, setStoredMetrics] = useState<DefaultMetrics | null>(
    null
  )

  const [mappedCookies, setMappedCookies] = useState<ResponseCookie[]>([])
  const [mappedHeaders, setMappedHeaders] = useState<
    {
      key: string
      value: string
    }[]
  >([])

  const updateData = async () => {
    if (!focusedResponse || !workspace) {
      return
    }

    if (!scopeId || !rawBearer) {
      throw new Error('No scopeId or rawBearer')
    }

    const globeTestLogsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: focusedResponse.get('globeTestLogs').storeReceipt,
    })

    const responsePromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: focusedResponse.get('response').storeReceipt,
    })

    const metricsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: focusedResponse.get('metrics').storeReceipt,
    })

    const [globeTestLogsResult, responseResult, metricsResult] =
      await Promise.all([globeTestLogsPromise, responsePromise, metricsPromise])

    setStoredResponse(responseResult.data)
    setStoredGlobeTestLogs(
      globeTestLogsResult.data.map((log: string) => parseMessage(log))
    )
    setStoredMetrics(metricsResult.data)

    setMappedCookies(
      Object.values(
        (responseResult.data.request as Response | null)?.cookies ?? []
      ).flat()
    )
    console.log(
      'responseREs',
      responseResult,
      Object.entries((responseResult.data as Response | null)?.headers ?? {})
        .map(([key, value]) => ({
          key,
          value,
        }))
        .flat()
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
    if (storedResponse) {
      setStoredResponse(null)
    }
    if (storedGlobeTestLogs) {
      setStoredGlobeTestLogs(null)
    }
    if (storedMetrics) {
      setStoredMetrics(null)
    }

    if (!workspace) {
      throw new Error('No workspace YDoc')
    }

    updateData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponse])

  return (
    <PanelLayout
      tabNames={['Body', 'Headers', 'Cookies', 'Execution', 'Request']}
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
        <QuickSuccessSingleStats
          statusCode={focusedResponse.get('statusCode')}
          responseTimeMilliseconds={
            focusedResponse.get('meta').responseDuration
          }
          responseSizeBytes={focusedResponse.get('meta').responseSize}
        />
      }
    >
      {storedResponse && storedMetrics && storedGlobeTestLogs ? (
        <>
          {activeTabIndex === 0 && (
            <BodyPanel
              response={storedResponse}
              setActionArea={setActionArea}
            />
          )}
          {activeTabIndex === 1 && (
            <KeyValueResultsTable
              setActionArea={setActionArea}
              values={mappedHeaders}
            />
          )}
          {activeTabIndex === 2 && (
            <CookieTable
              // Reduce cookie values to array of ResponseCookie
              cookies={mappedCookies}
              setActionArea={setActionArea}
            />
          )}
          {activeTabIndex === 3 && (
            <ExecutionPanel
              setActionArea={setActionArea}
              globeTestLogs={storedGlobeTestLogs}
              metrics={storedMetrics}
            />
          )}
          {activeTabIndex === 4 && (
            <UnderlyingRequestPanel
              setActionArea={setActionArea}
              request={storedResponse.request}
            />
          )}
        </>
      ) : (
        <Box
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Skeleton width={100000} height={100000} />
        </Box>
      )}
    </PanelLayout>
  )
}
