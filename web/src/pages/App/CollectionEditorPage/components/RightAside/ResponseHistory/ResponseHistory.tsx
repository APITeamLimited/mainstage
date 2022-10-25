/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Stack, Typography, Box, useTheme, Button } from '@mui/material'
import type { Map as YMap } from 'yjs'

import {
  clearFocusedRESTResponse,
  focusedResponseVar,
  updateFocusedRESTResponse,
} from 'src/contexts/focused-response'
import { useSimplebarReactModule, useYJSModule } from 'src/contexts/imports'
import { focusedElementVar, getFocusedElementKey } from 'src/contexts/reactives'
import { deleteRestResponse } from 'src/entity-engine/handlers/rest-response'
import { useYMap } from 'src/lib/zustand-yjs'

import { RightAsideLayout } from '../RightAsideLayout'

import { ResponseHistoryItem } from './ResponseHistoryItem'

type GroupedResponses = {
  [key: string]: YMap<any>[]
}

type ResponseHistoryProps = {
  onCloseAside: () => void
  collectionYMap: YMap<any>
  includeAll?: boolean
}

export const ResponseHistory = ({
  onCloseAside,
  collectionYMap,
  includeAll,
}: ResponseHistoryProps) => {
  const Y = useYJSModule()
  const { default: SimpleBar } = useSimplebarReactModule()

  const theme = useTheme()

  const focusedElementDict = useReactiveVar(focusedElementVar)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  const collectionHook = useYMap(collectionYMap)

  const restResponsesYMap = (collectionYMap.get('restResponses') ??
    new Y.Map()) as YMap<any>
  const responsesHook = useYMap(restResponsesYMap)

  const groupedResponses = useMemo(() => {
    if (
      focusedElementDict[getFocusedElementKey(collectionYMap)]?.get(
        '__typename'
      ) !== 'RESTRequest'
    ) {
      throw `focusedElementDict.__typename: '${focusedElementDict[
        getFocusedElementKey(collectionYMap)
      ]?.get('__typename')}' invalid for ResponseHistory`
    }

    const parentId =
      focusedElementDict[getFocusedElementKey(collectionYMap)]?.get('id')

    const responses: YMap<any>[] = (
      Array.from(restResponsesYMap.values()) as YMap<any>[]
    ).filter((response) => {
      const baseCondition =
        response.get('__subtype') === 'SuccessSingleResult' ||
        response.get('__subtype') === 'FailureResult' ||
        response.get('__subtype') === 'LoadingResponse' ||
        response.get('__subtype') === 'SuccessMultipleResult'

      return includeAll
        ? baseCondition
        : baseCondition && response.get('parentId') === parentId
    })

    // Sort most recent first
    responses.sort((a, b) => {
      const aDate = new Date(a.get('createdAt'))
      const bDate = new Date(b.get('createdAt'))
      return bDate.getTime() - aDate.getTime()
    })

    /*
    // TODO: Move deletion serverside

        const responsesToDelete: YMap<any>[] = []

    if (responses.length > 100) {
      responsesToDelete.push(...responses.slice(100))
    }

    if (responsesToDelete.length > 0) {
      deleteRestResponse(responsesToDelete)
    }

    // Ensure responses not in responsesToDelete by id
    const checkedResponses = responses.filter(
      (response) =>
        !responsesToDelete.some(
          (responseToDelete) =>
            response.get('id') === responseToDelete.get('id')
        )
    )

    */

    // Group requests by time, less than a day group by hour, more than a day group by day
    const groupedResponsesNew: GroupedResponses = {}
    const currentDate = new Date()

    responses.forEach((response) => {
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

        if (!groupedResponsesNew[timeLabel]) {
          groupedResponsesNew[timeLabel] = []
        }

        groupedResponsesNew[timeLabel].push(response)
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

        if (!groupedResponsesNew[timeLabel]) {
          groupedResponsesNew[timeLabel] = []
        }

        groupedResponsesNew[timeLabel].push(response)
      }
    })

    return groupedResponsesNew
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsesHook, collectionHook, focusedElementDict])

  const handleDeleteResponse = (responseId: string) => {
    const restResponse = restResponsesYMap.get(responseId) as YMap<any>
    clearFocusedRESTResponse(focusedElementDict, restResponse)
    deleteRestResponse([restResponse])

    const focusedRequestId = focusedElementDict[
      getFocusedElementKey(collectionYMap)
    ]?.get('id') as string | undefined

    if (!focusedRequestId) {
      return
    }

    // Set focused response to the next most recent response
    const responses = (Array.from(restResponsesYMap.values()) as YMap<any>[])
      .filter((response) => response.get('parentId') === focusedRequestId)
      .sort((a, b) => {
        const aDate = new Date(a.get('createdAt'))
        const bDate = new Date(b.get('createdAt'))
        return bDate.getTime() - aDate.getTime()
      })

    if (responses.length > 0) {
      updateFocusedRESTResponse(focusedResponseDict, responses[0])
    }
  }

  const handleDeleteAllResponses = () => {
    clearFocusedRESTResponse(focusedElementDict, collectionYMap)

    Object.values(groupedResponses).forEach((responses) =>
      responses.forEach((responseYMap) => {
        restResponsesYMap.delete(responseYMap.get('id'))
      })
    )
  }

  return (
    <RightAsideLayout title="Response History" onCloseAside={onCloseAside}>
      <Stack
        spacing={2}
        sx={{
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        {Object.keys(groupedResponses).length > 0 && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              paddingX: 2,
            }}
          >
            <Button
              size="small"
              onClick={handleDeleteAllResponses}
              variant="outlined"
              sx={{
                width: '100%',
              }}
            >
              Delete All
            </Button>
          </Stack>
        )}
        <Box
          sx={{
            overflow: 'hidden',
            height: '100%',
            maxHeight: '100%',
          }}
        >
          <SimpleBar style={{ maxHeight: '100%' }}>
            <Box sx={{ paddingBottom: 2 }}>
              {Object.values(groupedResponses).length === 0 ? (
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
                    No history yet, when this request is sent its response
                    history will be shown here
                  </span>
                </Typography>
              ) : (
                <>
                  {Object.keys(groupedResponses).map((timeLabel) => (
                    <Box
                      key={timeLabel}
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
                      {groupedResponses[timeLabel].map((response) => {
                        // Need to get litteral value of response id for re-rendering
                        // to work properly
                        const id = response.get('id')

                        return (
                          <ResponseHistoryItem
                            key={id}
                            responseYMap={response}
                            collectionYMap={collectionYMap}
                            focusedResponseDict={focusedResponseDict}
                            handleDeleteResponse={() =>
                              handleDeleteResponse(id)
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
                      Responses more than 100 deep are deleted automatically,
                      pin them to keep them
                    </span>
                  </Typography>
                </>
              )}
            </Box>
          </SimpleBar>
        </Box>
      </Stack>
    </RightAsideLayout>
  )
}
