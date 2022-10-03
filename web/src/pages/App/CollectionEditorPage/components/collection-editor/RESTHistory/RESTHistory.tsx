/* eslint-disable @typescript-eslint/no-explicit-any */

import { useReactiveVar } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import {
  Stack,
  Typography,
  Box,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material'
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'zustand-yjs'

import {
  clearFocusedRESTResponse,
  focusedResponseVar,
} from 'src/contexts/focused-response'
import { focusedElementVar, getFocusedElementKey } from 'src/contexts/reactives'
import { deleteRestResponse } from 'src/entity-engine/handlers/rest-response'

import { RESTHistoryItem } from './RESTHistoryItem'

type GroupedResponses = {
  [key: string]: YMap<any>[]
}

type RESTHistoryProps = {
  onCloseAside: () => void
  collectionYMap: YMap<any>
}

export const RESTHistory = ({
  onCloseAside,
  collectionYMap,
}: RESTHistoryProps) => {
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const restResponsesYMap = collectionYMap.get('restResponses')

  useYMap(restResponsesYMap)

  const theme = useTheme()
  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  if (
    focusedElementDict[getFocusedElementKey(collectionYMap)]?.get(
      '__typename'
    ) !== 'RESTRequest'
  ) {
    throw `focusedElementDict.__typename: '${focusedElementDict[
      getFocusedElementKey(collectionYMap)
    ]?.get('__typename')}' invalid for RESTHistory`
  }

  const handleDeleteResponse = (responseId: string) => {
    const restResponse = restResponsesYMap.get(responseId) as YMap<any>
    clearFocusedRESTResponse(focusedElementDict, restResponse)
    deleteRestResponse([restResponse])
  }

  const responsesToDelete: YMap<any>[] = []

  const responses: YMap<any>[] = (
    Array.from(restResponsesYMap.values()) as YMap<any>[]
  ).filter((response) => {
    return (
      response.get('__subtype') === 'SuccessSingleResult' ||
      response.get('__subtype') === 'FailureResult' ||
      response.get('__subtype') === 'LoadingResponse'
    )
  })

  // Sort most recent first
  responses.sort((a, b) => {
    const aDate = new Date(a.get('createdAt'))
    const bDate = new Date(b.get('createdAt'))
    return bDate.getTime() - aDate.getTime()
  })

  if (responses.length > 100) {
    responsesToDelete.push(...responses.slice(100))
  }

  if (responsesToDelete.length > 0) {
    deleteRestResponse(responsesToDelete)
  }

  // Ensure responses not in responsesToDelete by id
  const responsesChecked = responses.filter(
    (response) =>
      !responsesToDelete.some(
        (responseToDelete) => response.get('id') === responseToDelete.get('id')
      )
  )

  // Group requests by time, less than a day group by hour, more than a day group by day

  const grouptedResonses: GroupedResponses = {}
  const currentDate = new Date()

  responsesChecked.forEach((response) => {
    // If less than a day, group by hour
    if (
      currentDate.getTime() - new Date(response.get('createdAt')).getTime() <
      1000 * 60 * 60 * 24
    ) {
      const hoursAgo =
        (currentDate.getTime() -
          new Date(response.get('createdAt')).getTime()) /
        1000 /
        60 /
        60

      let timeLabel = ''

      if (hoursAgo < 1) {
        timeLabel = 'Less than an hour ago'
      } else {
        timeLabel = `${Math.round(hoursAgo)} hours ago`
      }

      if (!grouptedResonses[timeLabel]) {
        grouptedResonses[timeLabel] = []
      }

      grouptedResonses[timeLabel].push(response)
    } else {
      // If more than a day, group by day
      const daysAgo =
        (currentDate.getTime() -
          new Date(response.get('createdAt')).getTime()) /
        1000 /
        60 /
        60 /
        24

      const timeLabel = `${Math.round(daysAgo)} days ago`

      if (!grouptedResonses[timeLabel]) {
        grouptedResonses[timeLabel] = []
      }

      grouptedResonses[timeLabel].push(response)
    }
  })

  return (
    <Stack
      spacing={2}
      sx={{
        overflowY: 'auto',
        width: '100%',
        maxWidth: '100%',
        height: 'calc(100% - 1rem)',
        maxHeight: 'calc(100% - 1rem)',
        paddingTop: 2,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          marginX: 2,
        }}
      >
        <Typography variant="h6">
          <span
            style={{
              userSelect: 'none',
            }}
          >
            Response History
          </span>
        </Typography>
        <Tooltip title="Close">
          <IconButton
            onClick={onCloseAside}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Box
        sx={{
          maxHeight: '100%',
          paddingBottom: 2,
          overflowY: 'auto',
        }}
      >
        {responses.length === 0 ? (
          <Typography
            sx={{
              overflow: 'hidden',
              color: theme.palette.text.secondary,
              paddingX: 2,
            }}
            fontSize="small"
          >
            <span
              style={{
                userSelect: 'none',
              }}
            >
              No history yet, when this request is sent its response history
              will be shown here
            </span>
          </Typography>
        ) : (
          <>
            {Object.keys(grouptedResonses).map((timeLabel, index) => (
              <Box
                key={index}
                sx={{
                  marginBottom: 2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    marginX: 2,
                    marginBottom: 1,
                  }}
                >
                  <span
                    style={{
                      userSelect: 'none',
                    }}
                  >
                    {timeLabel}:
                  </span>
                </Typography>
                {grouptedResonses[timeLabel].map((response) => {
                  // Need to get litteral value of response id for re-rendering
                  // to work properly
                  const id = response.get('id')

                  return (
                    <RESTHistoryItem
                      key={id}
                      responseYMap={response}
                      collectionYMap={collectionYMap}
                      focusedResponseDict={focusedResponseDict}
                      handleDeleteResponse={() =>
                        handleDeleteResponse(response.get('id'))
                      }
                    />
                  )
                })}
              </Box>
            ))}
            <Typography
              sx={{
                overflow: 'hidden',
                color: theme.palette.text.secondary,
                paddingX: 2,
              }}
              fontSize="small"
            >
              <span
                style={{
                  userSelect: 'none',
                }}
              >
                Responses more than 100 deep are deleted automatically
              </span>
            </Typography>
          </>
        )}
      </Box>
    </Stack>
  )
}
