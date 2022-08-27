/* eslint-disable @typescript-eslint/no-explicit-any */
import { useReactiveVar } from '@apollo/client'
import ClearIcon from '@mui/icons-material/Clear'
import CloseIcon from '@mui/icons-material/Close'
import {
  Stack,
  Typography,
  Box,
  useTheme,
  ListItemText,
  ListItemIcon,
  ListItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { focusedElementVar, getFocusedElementKey } from 'src/contexts/reactives'
import { deleteRestResponse } from 'src/entity-engine/handlers/rest-response'

import { getNodeIcon } from './CollectionTree/Node/utils'
import {
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
  const restResponses = useYMap(restResponsesYMap)
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
    deleteRestResponse([restResponse])
  }

  // Filter within 30 days
  const responsesToDelete = (
    Array.from(restResponsesYMap.values()) as Y.Map<any>[]
  ).filter(
    (response) =>
      new Date(response.get('createdAt')).getTime() - new Date().getTime() >
      30 * 24 * 60 * 60 * 1000
  )

  const responses = (
    Array.from(restResponsesYMap.values()) as Y.Map<any>[]
  ).filter((response) => {
    return response.get('type') === 'Success' || response.get('type') === 'Fail'
  })

  // Sort most recent first
  responses.sort((a, b) => {
    const aDate = new Date(a.get('createdAt'))
    const bDate = new Date(b.get('createdAt'))
    return bDate.getTime() - aDate.getTime()
  })

  if (responses.length > 30) {
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
        (currentDate.getTime() - response.get('createdAt').getTime()) /
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
    <Box
      sx={{
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        paddingY: 2,
        overflow: 'hidden',
      }}
    >
      <Stack
        spacing={2}
        sx={{
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
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
          <Typography variant="h6">Response History</Typography>
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
        {responses.length === 0 ? (
          <Typography
            sx={{
              overflow: 'hidden',
              color: theme.palette.text.secondary,
              paddingX: 2,
            }}
            fontSize="small"
          >
            No history yet, when this request is sent its response history will
            be shown here
          </Typography>
        ) : (
          <div
            style={{
              width: '100%',
              minHeight: '100%',
            }}
          >
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
                  {timeLabel}:
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
                      : response.get('statusCode') < 300
                      ? theme.palette.warning.main
                      : theme.palette.error.main

                  return (
                    <ListItem
                      key={index}
                      sx={{
                        paddingY: 0.75,
                        cursor: 'pointer',
                        backgroundColor:
                          focusedResponseDict[
                            getFocusedElementKey(collectionYMap)
                          ]?.get('id') === response.get('id')
                            ? theme.palette.alternate.main
                            : 'inherit',
                        width: '100%',
                        maxWidth: '100%',
                      }}
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
                    >
                      <ListItemIcon color={theme.palette.text.secondary}>
                        {getNodeIcon(response, true)}
                      </ListItemIcon>
                      <ListItemText
                        primary={<span>{response.get('endpoint')}</span>}
                        sx={{
                          whiteSpace: 'nowrap',
                          marginLeft: -2,
                          color: statusCodeColor,
                          overflow: 'hidden',
                        }}
                      />
                    </ListItem>
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
              Responses older than 30 days, or more than 30 deep are deleted
              automatically
            </Typography>
          </div>
        )}
      </Stack>
    </Box>
  )
}
