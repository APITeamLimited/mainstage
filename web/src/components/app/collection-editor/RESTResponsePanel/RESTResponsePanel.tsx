import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { makeVar } from '@apollo/client'
import CommentIcon from '@mui/icons-material/Comment'
import { Stack, Typography, useTheme } from '@mui/material'
import { Response } from 'k6/http'
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

import { BodyPanel } from './BodyPanel'
import { HeadersPanel } from './HeadersPanel'
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

  const rawBearer = useRawBearer()
  const scopes = useScopes()

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

  /*useEffect(() => {
    // Make sure response only filtered to current request
    const successfulResponses = Array.from(restResponsesYMap.values()).filter(
      (response: Y.Map<any>) =>
        response.get('parentId') === focusedElement.get('id') &&
        (response.get('type') === 'Success' ||
          response.get('type') === 'Fail') &&
        focusedElement.get('__typename') === 'RESTRequest'
    ) as Y.Map<any>[]

    console.log('successfulResponses', successfulResponses)

    if (successfulResponses.length > 0) {
      // Select latest createdAt successful response
      updateFocusedRESTResponse(
        focusedResponseDict,
        successfulResponses.reduce((latest, current) => {
          if (
            new Date(latest.get('createdAt')).getTime() <
            new Date(current.get('createdAt')).getTime()
          ) {
            return current
          }
          return latest
        })
      )
    } else {
      focusedResponseVar({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedElement, restResponses])*/

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

  console.log(storedResponse?.headers)

  return (
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
        storedResponse && storedMetrics && storedGlobeTestLogs ? (
          <>
            <QuickStats
              statusCode={focusedResponse.get('statusCode')}
              responseTimeMilliseconds={
                focusedResponse.get('meta').responseDuration
              }
              responseSizeBytes={focusedResponse.get('meta').responseSize}
            />
            <CustomTabs
              value={activeTabIndex}
              onChange={setActiveTabIndex}
              names={['Body', 'Headers', 'Cookies', 'Request']}
            />
            {/*activeTabIndex === 0 && <BodyPanel response={focusedResponse} />*/}
            {activeTabIndex === 1 && (
              <HeadersPanel headers={storedResponse.headers} />
            )}
          </>
        ) : (
          <h1>Loading</h1>
        )
      ) : (
        <Stack
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <CommentIcon
            sx={{
              marginBottom: 2,
              width: 80,
              height: 80,
              color: theme.palette.action.disabled,
            }}
          />
          <Typography variant="h6">No response yet</Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            Add a url above and hit send to see the response
          </Typography>
        </Stack>
      )}
    </Stack>
  )
}
