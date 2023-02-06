import { useReactiveVar } from '@apollo/client'
import ReorderIcon from '@mui/icons-material/Reorder'
import { Stack, Typography, Box, useTheme, Button } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { focusedResponseVar } from 'src/contexts/focused-response'
import { useSimplebarReactModule } from 'src/contexts/imports'

import { EmptyAside } from '../../shared/EmptyAside'
import { RightAsideLayout } from '../RightAsideLayout'

import { useGroupedResponses } from './grouped-responses'
import { ResponseHistoryItem } from './ResponseHistoryItem'

type InnerResponseHistoryProps = {
  onCloseAside: () => void
  collectionYMap: YMap<any>
}

export const InnerResponseHistory = ({
  onCloseAside,
  collectionYMap,
}: InnerResponseHistoryProps) => {
  const theme = useTheme()

  const { groupedResponses, handleDeleteResponse, handleDeleteAllResponses } =
    useGroupedResponses()
  const { default: SimpleBar } = useSimplebarReactModule()
  const focusedResponseDict = useReactiveVar(focusedResponseVar)

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
                <EmptyAside
                  primaryText="No Responses"
                  secondaryText="When you send requests or execute tests, they will appear here."
                  icon={ReorderIcon}
                />
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
                    {/* <span
                style={{
                  userSelect: 'none',
                }}
              >
                Responses more than 100 deep are deleted automatically,
                pin them to keep them
              </span> */}
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
          </SimpleBar>
        </Box>
      </Stack>
    </RightAsideLayout>
  )
}
