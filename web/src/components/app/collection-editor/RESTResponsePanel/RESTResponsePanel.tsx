import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { makeVar } from '@apollo/client'
import CommentIcon from '@mui/icons-material/Comment'
import { Stack, Typography, useTheme } from '@mui/material'
import { Response, ResponseCookie } from 'k6/http'
import { DefaultMetrics, GlobeTestMessage } from 'types/src'
import * as Y from 'yjs'
import { useYDoc, useYMap } from 'zustand-yjs'

import {
  focusedElementVar,
  getFocusedElementKey,
  FocusedElementDictionary,
} from 'src/contexts/reactives'
import {
  useRawBearer,
  useScopes,
  useWorkspace,
} from 'src/entity-engine/EntityEngine'
import { retrieveScopedResource } from 'src/store'

import { CustomTabs } from '../../CustomTabs'
import { EmptyPanelMessage } from '../../utils/EmptyPanelMessage'
import { KeyValueResultsTable } from '../../utils/KeyValueResultsTable'
import { PanelLayout } from '../PanelLayout'

import { BodyPanel } from './BodyPanel'
import { CookieTable } from './CookieTable'
import { QuickStats } from './QuickStats'

type RESTResponsePanelProps = {
  collectionYMap: Y.Map<any>
}

export const focusedResponseVar = makeVar<FocusedElementDictionary>({})

export const updateFocusedRESTResponse = (
  focusedResponseDict: FocusedElementDictionary,
  focusYMap: Y.Map<any>
) => {
  const newName = getFocusedElementKey(focusYMap)

  focusedResponseVar({
    ...focusedResponseDict,
    [newName]: focusYMap,
  })
}

export const clearFocusedRESTResponse = (
  focusedResponseDict: FocusedElementDictionary,
  originalFocusYMap: Y.Map<any>
) => {
  const newName = getFocusedElementKey(originalFocusYMap)

  const newFocusedResponseDict = { ...focusedResponseDict }
  delete newFocusedResponseDict[newName]

  focusedResponseVar(newFocusedResponseDict)
}

export const RESTResponsePanel = ({
  collectionYMap,
}: RESTResponsePanelProps) => {
  const theme = useTheme()
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const restResponsesYMap = collectionYMap.get('restResponses')
  const workspace = useWorkspace()

  const restResponses = useYMap<any>(restResponsesYMap)
  const focusedElement =
    focusedElementDict[getFocusedElementKey(collectionYMap)]

  const focusedResponse =
    focusedResponseDict[getFocusedElementKey(collectionYMap)]

  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const [storedResponse, setStoredResponse] = useState<Response | null>(null)

  const [storedGlobeTestLogs, setStoredGlobeTestLogs] = useState<
    GlobeTestMessage[] | null
  >(null)

  const [storedMetrics, setStoredMetrics] = useState<DefaultMetrics | null>(
    null
  )

  const loaded =
    storedResponse !== null &&
    storedGlobeTestLogs !== null &&
    storedMetrics !== null

  const rawBearer = useRawBearer()
  const scopes = useScopes()

  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  const updateData = async () => {
    // Find scope matching workspace guid
    const [variant, variantTargetId] = workspace.guid.split(
      ':'
    ) as Array<string>

    const scopeId = scopes?.find(
      (scope) =>
        scope.variant === variant && scope.variantTargetId === variantTargetId
    )?.id

    if (!scopeId || !rawBearer) {
      throw new Error('No scopeId or rawBearer')
    }

    const globeTestLogsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      resourceName: focusedResponse.get('globeTestLogs').storeReceipt,
    })

    const responsePromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      resourceName: focusedResponse.get('response').storeReceipt,
    })

    const metricsPromise = retrieveScopedResource({
      scopeId,
      rawBearer,
      resourceName: focusedResponse.get('metrics').storeReceipt,
    })

    const [globeTestLogsResult, responseResult, metricsResult] =
      await Promise.all([globeTestLogsPromise, responsePromise, metricsPromise])

    setStoredResponse(responseResult.data)
    setStoredGlobeTestLogs(globeTestLogsResult.data)
    setStoredMetrics(metricsResult.data)
  }

  const [mappedCookies, setMappedCookies] = useState<ResponseCookie[]>([])
  const [mappedHeaders, setMappedHeaders] = useState<
    {
      key: string
      value: string
    }[]
  >([])

  useEffect(() => {
    setMappedCookies(Object.values(storedResponse?.cookies || []).flat())
    setMappedHeaders(
      Object.entries(storedResponse?.headers || {}).map(([key, value]) => ({
        key,
        value,
      }))
    )
  }, [storedResponse])

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
    if (!focusedResponse) {
      return
    }

    if (!focusedResponse.get('id')) {
      return
    }

    if (!workspace) {
      throw new Error('No workspace YDoc')
    }

    updateData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponse, rawBearer, scopes, workspace])

  if (focusedResponse) {
    if (
      focusedResponse.get('type') !== 'Success' &&
      focusedResponse.get('type') !== 'Fail'
    ) {
      throw `Response type: ${focusedResponse.get(
        'type'
      )} invalid for RESTResponsePanel`
    }
  }

  return focusedResponse && loaded ? (
    <PanelLayout
      aboveTabsArea={
        <QuickStats
          statusCode={focusedResponse.get('statusCode')}
          responseTimeMilliseconds={
            focusedResponse.get('meta').responseDuration
          }
          responseSizeBytes={focusedResponse.get('meta').responseSize}
        />
      }
      // TODO: add request and globe test log tabs
      tabNames={['Body', 'Headers', 'Cookies']}
      activeTabIndex={activeTabIndex}
      setActiveTabIndex={setActiveTabIndex}
      actionArea={actionArea}
    >
      {activeTabIndex === 0 && (
        <BodyPanel response={storedResponse} setActionArea={setActionArea} />
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
    </PanelLayout>
  ) : (
    <Stack
      margin={2}
      spacing={2}
      sx={{
        height: 'calc(100% - 2em)',
        maxHeight: 'calc(100% - 2em)',
        overflow: 'hidden',
      }}
    >
      {focusedResponse ? (
        <h1>Loading</h1>
      ) : (
        <EmptyPanelMessage
          icon={
            <CommentIcon
              sx={{
                marginBottom: 2,
                width: 80,
                height: 80,
                color: theme.palette.action.disabled,
              }}
            />
          }
          primaryText="No response yet"
          secondaryMessages={[
            'Add a url above and hit send to see the response',
          ]}
        />
      )}
    </Stack>
  )
}
