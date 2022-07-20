import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import CommentIcon from '@mui/icons-material/Comment'
import { Button, Stack, Tab, Tabs, Typography, useTheme } from '@mui/material'

import {
  LocalRESTResponse,
  localRESTResponsesVar,
} from 'src/contexts/reactives'

import { focusedElementVar } from '../reactives'

import { BodyPanel } from './BodyPanel'
import { HeadersPanel } from './HeadersPanel'
import { QuickStats } from './QuickStats'

type RESTResponsePanelProps = {}

export const RESTResponsePanel = ({}: RESTResponsePanelProps) => {
  const theme = useTheme()
  const [shownResponse, setShownResponse] = useState<LocalRESTResponse | null>(
    null
  )
  const localRESTResponses = useReactiveVar(localRESTResponsesVar)
  const focusedElement = useReactiveVar(focusedElementVar)

  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const handleTabChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    setActiveTabIndex(newValue)
  }

  useEffect(() => {
    // Make sure response only filtered to current request
    const successfulResponses = localRESTResponses.filter(
      (response) =>
        response.type === 'Success' &&
        response.request?.id === focusedElement?.id &&
        focusedElement.__typename === 'LocalRESTRequest'
    )

    if (successfulResponses.length > 0) {
      // Get latest createdAt successful response
      setShownResponse(
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
      setShownResponse(null)
    }
  }, [focusedElement, localRESTResponses])

  if (shownResponse) {
    if (shownResponse.type !== 'Success') {
      throw `Rsponse type: ${shownResponse.type} invalid for RESTResponsePanel`
    }
  }

  return (
    <Stack
      padding={2}
      spacing={2}
      sx={{
        height: 'calc(100% - 2em)',
      }}
    >
      {shownResponse ? (
        <>
          <QuickStats
            statusCode={shownResponse.statusCode}
            responseTimeMilliseconds={shownResponse.meta.responseDuration}
            responseSizeBytes={shownResponse.meta.responseSize}
          />
          <Tabs
            value={activeTabIndex}
            onChange={handleTabChange}
            variant="scrollable"
          >
            <Tab label="Body" />
            <Tab label="Headers" />
            <Tab label="Cookies" />
            <Tab label="Request" />
          </Tabs>
          {activeTabIndex === 0 && <BodyPanel response={shownResponse} />}
          {activeTabIndex === 1 && (
            <HeadersPanel headers={shownResponse.headers} />
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
