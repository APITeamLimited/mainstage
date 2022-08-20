import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { makeVar } from '@apollo/client'
import CommentIcon from '@mui/icons-material/Comment'
import { Stack, Typography, useTheme } from '@mui/material'

import { RESTResponse, localRESTResponsesVar } from 'src/contexts/reactives'

import { CustomTabs } from '../../CustomTabs'

import { BodyPanel } from './BodyPanel'
import { HeadersPanel } from './HeadersPanel'
import { QuickStats } from './QuickStats'

type RESTResponsePanelProps = {}

export const focusedResponseVar = makeVar<RESTResponse | null>(null)

export const RESTResponsePanel = ({}: RESTResponsePanelProps) => {
  const theme = useTheme()
  const focusedResponse = useReactiveVar(focusedResponseVar)
  const localRESTResponses = useReactiveVar(localRESTResponsesVar)
  const focusedElement = useReactiveVar(focusedElementVar)

  const [activeTabIndex, setActiveTabIndex] = useState(0)

  useEffect(() => {
    // Make sure response only filtered to current request
    const successfulResponses = localRESTResponses.filter(
      (response) =>
        (response.type === 'Success' || response.type === 'Fail') &&
        response.request?.id === focusedElement?.id &&
        focusedElement.__typename === 'RESTRequest'
    )

    if (successfulResponses.length > 0) {
      // Get latest createdAt successful response
      focusedResponseVar(
        successfulResponses.reduce((latest, current) => {
          if (
            new Date(latest.createdAt).getTime() <
            new Date(current.createdAt).getTime()
          ) {
            return current
          }
          return latest
        })
      )
    } else {
      focusedResponseVar(null)
    }
  }, [focusedElement, localRESTResponses])

  if (focusedResponse) {
    if (
      focusedResponse?.type !== 'Success' &&
      focusedResponse?.type !== 'Fail'
    ) {
      throw `Response type: ${focusedResponse?.type} invalid for RESTResponsePanel`
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
            statusCode={focusedResponse.statusCode}
            responseTimeMilliseconds={focusedResponse.meta.responseDuration}
            responseSizeBytes={focusedResponse.meta.responseSize}
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
