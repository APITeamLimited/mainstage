/* eslint-disable @typescript-eslint/no-explicit-any */

import { useReactiveVar } from '@apollo/client'
import ClearIcon from '@mui/icons-material/Clear'
import CloseIcon from '@mui/icons-material/Close'
import {
  Stack,
  Typography,
  Box,
  useTheme,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { focusedElementVar, getFocusedElementKey } from 'src/contexts/reactives'
import { deleteRestResponse } from 'src/entity-engine/handlers/rest-response'

import { RequestListItem } from '../utils/RequestListItem'

import { getNodeIcon } from './CollectionTree/Node/utils'
import {
  clearFocusedRESTResponse,
  focusedResponseVar,
  updateFocusedRESTResponse,
} from './RESTResponsePanel'

type GroupedResponses = {
  [key: string]: Y.Map<any>[]
}

type RESTHistoryProps = {
  onCloseAside: () => void
  collectionYMap: Y.Map<any>
}

export const RESTHistory = ({
  onCloseAside,
  collectionYMap,
}: RESTHistoryProps) => {
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const restResponsesYMap = collectionYMap.get('restResponses')
  const restRequestsYMap = collectionYMap.get('restRequests')

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
    const restResponse = restResponsesYMap.get(responseId) as Y.Map<any>
    clearFocusedRESTResponse(focusedElementDict, restResponse)
    deleteRestResponse([restResponse])
  }

  // Filter within 30 days
  /*const responsesToDelete = (
    Array.from(restResponsesYMap.values()) as Y.Map<any>[]
  ).filter(
    (response) =>
      new Date(response.get('createdAt')).getTime() - new Date().getTime() >
      30 * 24 * 60 * 60 * 1000
  )*/
  const responsesToDelete: Y.Map<any>[] = []

  const rawResponses: Y.Map<any>[] = (
    Array.from(restResponsesYMap.values()) as Y.Map<any>[]
  ).filter((response) => {
    return response.get('type') === 'Success' || response.get('type') === 'Fail'
  })

  const responses: Y.Map<any>[] = []

  rawResponses.forEach((response) => {
    // Ensure that the response has a parent request else mark it for deletion
    const parentId = response.get('parentId')

    if (!parentId) {
      responsesToDelete.push(response)
      return
    }
    if (!restRequestsYMap.has(parentId)) responsesToDelete.push(response)
    responses.push(response)
  })

  // Sort most recent first
  responses.sort((a, b) => {
    const aDate = new Date(a.get('createdAt'))
    const bDate = new Date(b.get('createdAt'))
    return bDate.getTime() - aDate.getTime()
  })

  if (responses.length > 100) {
    responsesToDelete.push(...responses.slice(30))
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
        height: 'calc(100% - 1em)',
        maxHeight: 'calc(100% - 1em)',
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
                {grouptedResonses[timeLabel].map((response, index) => {
                  if (
                    response.get('type') !== 'Success' &&
                    response.get('type') !== 'Fail'
                  ) {
                    return null
                  }

                  const statusCodeColor =
                    response.get('statusCode') >= 200 &&
                    response.get('statusCode') < 300
                      ? theme.palette.success.main
                      : response.get('statusCode') < 400
                      ? theme.palette.warning.main
                      : theme.palette.error.main

                  return (
                    <RequestListItem
                      key={index}
                      isInFocus={
                        focusedResponseDict[
                          getFocusedElementKey(collectionYMap)
                        ]?.get('id') === response.get('id')
                      }
                      onClick={() =>
                        updateFocusedRESTResponse(focusedResponseDict, response)
                      }
                      secondaryAction={
                        <Tooltip title="Delete" placement="left">
                          <IconButton
                            edge="end"
                            aria-label="Delete response"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDeleteResponse(response.get('id'))
                            }}
                          >
                            <ClearIcon />
                          </IconButton>
                        </Tooltip>
                      }
                      icon={
                        <ListItemIcon color={theme.palette.text.secondary}>
                          {getNodeIcon(response, true)}
                        </ListItemIcon>
                      }
                      listItemTextSx={{
                        color: statusCodeColor,
                      }}
                      primaryText={response.get('name')}
                      secondaryText={new URL(response.get('endpoint')).pathname}
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
