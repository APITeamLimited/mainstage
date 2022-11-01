/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import { MemberAwareness } from '@apiteam/types'
import { useApolloClient } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import ReorderIcon from '@mui/icons-material/Reorder'
import {
  Dialog,
  DialogTitle,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  Divider,
  DialogActions,
  Button,
  Typography,
  Chip,
  Skeleton,
  DialogContent,
} from '@mui/material'
import {
  RunningTestsQuery,
  RunningTestsQueryVariables,
  CancelRunningTestMutation,
  CancelRunningTestMutationVariables,
} from 'types/graphql'

import { useMutation, useQuery } from '@redwoodjs/web'

import { snackSuccessMessageVar } from 'src/components/app/dialogs'
import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { QuickUserSummary } from 'src/components/app/utils/QuickUserSummary'
import { useSimplebarReactModule } from 'src/contexts/imports'
import {
  useServerAwareness,
  useWorkspaceInfo,
} from 'src/entity-engine/EntityEngine'

type RunningTestsDialogProps = {
  open: boolean
  onClose: () => void
}

const RUNNING_TESTS_QUERY = gql`
  query RunningTestsQuery($teamId: String) {
    runningTests(teamId: $teamId) {
      jobId
      sourceName
      createdByUserId
      createdAt
      status
    }
  }
`

const CANCEL_RUNNING_TEST_MUTATION = gql`
  mutation CancelRunningTestMutation($teamId: String, $jobId: String!) {
    cancelRunningTest(teamId: $teamId, jobId: $jobId)
  }
`

export const RunningTestsDialog = ({
  open,
  onClose,
}: RunningTestsDialogProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  const theme = useTheme()

  const workspaceInfo = useWorkspaceInfo()

  const teamId = useMemo(
    () =>
      workspaceInfo?.scope.variant === 'TEAM'
        ? workspaceInfo.scope.variantTargetId
        : null,
    [workspaceInfo]
  )

  const { data, loading } = useQuery<
    RunningTestsQuery,
    RunningTestsQueryVariables
  >(RUNNING_TESTS_QUERY, {
    variables: {
      teamId,
    },
    skip: !open,
    pollInterval: 1000,
  })

  const [cancelRunningTest] = useMutation<
    CancelRunningTestMutation,
    CancelRunningTestMutationVariables
  >(CANCEL_RUNNING_TEST_MUTATION, {
    refetchQueries: [
      {
        query: RUNNING_TESTS_QUERY,
        variables: {
          teamId,
        },
      },
    ],
    onCompleted: () => snackSuccessMessageVar('Stopping test run'),
  })

  const serverAwareness = useServerAwareness()

  const usedMembers = useMemo(() => {
    if (
      workspaceInfo?.scope?.variant !== 'TEAM' ||
      serverAwareness?.variant !== 'TEAM'
    ) {
      return [
        {
          userId: workspaceInfo?.scope?.userId,
          displayName: workspaceInfo?.scope?.displayName,
          role: 'OWNER',
          profilePicture: workspaceInfo?.scope?.profilePicture,
          joinedTeam: new Date(),
          lastOnline: new Date(),
        },
      ] as MemberAwareness[]
    }
    return serverAwareness.members as MemberAwareness[]
  }, [workspaceInfo, serverAwareness])

  const workspaceInfos = useMemo(() => {
    if (data?.runningTests) {
      return data.runningTests.map((test) => {
        const member = usedMembers.find(
          (member) => member.userId === test.createdByUserId
        )

        return {
          displayName: member?.displayName,
          profilePicture: member?.profilePicture ?? undefined,
        }
      })
    }
    return []
  }, [data, usedMembers])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          width: '100%',
        }}
      >
        <DialogTitle>Running Tests</DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            marginRight: 2,
          }}
        >
          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              sx={{
                color: theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Divider />
      <DialogContent
        sx={{
          height: '500px',
          padding: 3,
          maxWidth: '100%',
        }}
      >
        {!data && loading ? (
          <Skeleton height="100%" />
        ) : !data || data.runningTests.length === 0 ? (
          <EmptyPanelMessage
            primaryText="No running tests"
            secondaryMessages={["When you run tests, they'll appear here."]}
            icon={
              <ReorderIcon
                sx={{
                  marginBottom: 2,
                  width: 80,
                  height: 80,
                  color: theme.palette.action.disabled,
                }}
              />
            }
          />
        ) : (
          <SimpleBar
            style={{
              maxHeight: '100%',
              height: '500px',
            }}
          >
            <Stack
              spacing={3}
              sx={{ width: '100%', height: '100%' }}
              justifyContent="center"
            >
              <Stack spacing={2}>
                {data.runningTests.map((test, index) => (
                  <>
                    <Stack
                      key={test.jobId}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Stack spacing={2} justifyContent="space-between">
                        <Typography variant="body1" fontWeight="bold">
                          {test.sourceName}
                        </Typography>
                        <QuickUserSummary
                          displayName={workspaceInfos[index]?.displayName}
                          profilePicture={workspaceInfos[index]?.profilePicture}
                          minimal
                        />
                      </Stack>
                      <Stack
                        spacing={2}
                        justifyContent="space-between"
                        alignItems="flex-end"
                      >
                        <span>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() =>
                              cancelRunningTest({
                                variables: {
                                  teamId,
                                  jobId: test.jobId,
                                },
                              })
                            }
                          >
                            Cancel
                          </Button>
                        </span>
                        <Chip
                          size="small"
                          label={test.status}
                          color={
                            test.status === 'RUNNING'
                              ? 'primary'
                              : test.status === 'COMPLETED_SUCCESS' ||
                                test.status === 'SUCCESS'
                              ? 'success'
                              : test.status === 'COMPLETED_FAILURE' ||
                                test.status === 'FAILURE'
                              ? 'error'
                              : 'default'
                          }
                        />
                      </Stack>
                    </Stack>
                    {index !== data.runningTests.length - 1 && <Divider />}
                  </>
                ))}
              </Stack>
            </Stack>
          </SimpleBar>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
