/* eslint-disable @typescript-eslint/no-explicit-any */

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
  DialogContent,
} from '@mui/material'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { QuickUserSummary } from 'src/components/app/utils/QuickUserSummary'
import { LocalAgentIcon } from 'src/components/utils/Icons'
import { useSimplebarReactModule } from 'src/contexts/imports'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'
import { useLocalTestManager } from 'src/test-manager/executors/local-test-manager/LocalTestManagerProvider'

type RunningLocalTestsDialogProps = {
  open: boolean
  onClose: () => void
}

export const RunningLocalTestsDialog = ({
  open,
  onClose,
}: RunningLocalTestsDialogProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  const localManager = useLocalTestManager()
  const workspaceInfo = useWorkspaceInfo()

  const theme = useTheme()

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
        <DialogTitle>Running Local Tests</DialogTitle>
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
        {localManager === null ? (
          <EmptyPanelMessage
            primaryText="Localhost agent offline"
            secondaryMessages={[
              "APITeam Agent isn't running on localhost.",
              'Use APITeam Agent to run tests locally.',
            ]}
            iconComponent={LocalAgentIcon}
          >
            <Button
              variant="contained"
              color="primary"
              href="https://apiteam.cloud/agent"
              target="_blank"
              rel="noreferrer"
            >
              Learn more
            </Button>
          </EmptyPanelMessage>
        ) : localManager.runningTests.length === 0 ? (
          <EmptyPanelMessage
            primaryText="No running tests"
            secondaryMessages={["When you run tests, they'll appear here."]}
            iconComponent={ReorderIcon}
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
                {localManager.runningTests.map((test, index) => (
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
                          displayName={
                            test.createdByUserId === workspaceInfo?.scope.userId
                              ? 'You'
                              : test.createdByUserId
                          }
                          profilePicture={
                            test.createdByUserId === workspaceInfo?.scope.userId
                              ? workspaceInfo?.scope.profilePicture ?? undefined
                              : undefined
                          }
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
                            onClick={() => localManager.abortJob(test.jobId)}
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
                    {index !== localManager.runningTests.length - 1 && (
                      <Divider />
                    )}
                  </>
                ))}
              </Stack>
            </Stack>
          </SimpleBar>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
