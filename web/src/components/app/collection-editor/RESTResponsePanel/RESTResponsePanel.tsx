import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { makeVar } from '@apollo/client'
import CommentIcon from '@mui/icons-material/Comment'
import { Stack, Typography, useTheme } from '@mui/material'
import { useYMap } from 'zustand-yjs'

import {
  RESTResponse,
  localRESTResponsesVar,
  focusedElementVar,
  getFocusedElementKey,
  FocusedElementDictionary,
} from 'src/contexts/reactives'

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
  const restResponses = useYMap<any>(restResponsesYMap)

  const focusedElement =
    focusedElementDict[getFocusedElementKey(collectionYMap)]

  const focusedResponse =
    focusedResponseDict[getFocusedElementKey(collectionYMap)]

  const [activeTabIndex, setActiveTabIndex] = useState(0)

  useEffect(() => {
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
  }, [focusedElement, restResponses])

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
          {activeTabIndex === 0 && <BodyPanel response={focusedResponse} />}
          {activeTabIndex === 1 && (
            <HeadersPanel headers={focusedResponse.headers} />
          )}
        </>
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
