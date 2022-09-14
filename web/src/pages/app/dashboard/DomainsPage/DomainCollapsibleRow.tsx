import { useState } from 'react'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  ListItemText,
  Stack,
  Box,
  Button,
  MenuItem,
  Collapse,
  Typography,
  useTheme,
  Card,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tooltip,
  FormHelperText,
} from '@mui/material'
import {
  DeleteVerifiedDomainVariables,
  DeleteVerifiedDomain,
  PerformVerification,
  PerformVerificationVariables,
  VerifiedDomains,
} from 'types/graphql'

import { useMutation } from '@redwoodjs/web'

import { QueryDeleteDialog } from 'src/components/app/dialogs/QueryDeleteDialog'
import { CopyBox } from 'src/components/app/utils/CopyBox'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { PERFORM_VERIFICATION_MUTATION } from './AddDomainDialog'
import { DomainVerifiedChip } from './DomainVerifiedChip'

const DELETE_VERIFIED_DOMAIN_MUTATION = gql`
  mutation DeleteVerifiedDomain($verifiedDomainId: String!, $teamId: String) {
    deleteVerifiedDomain(verifiedDomainId: $verifiedDomainId, teamId: $teamId) {
      id
      domain
    }
  }
`

type DomainCollapsibleRowProps = {
  verifiedDomain: VerifiedDomains['verifiedDomains'][0]
  enableMutations: boolean
  setSnackSuccessMessage: (message: string) => void
  setSnackErrorMessage: (message: string) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  refetchDomainsCallback: () => void
}

export const DomainCollapsibleRow = ({
  verifiedDomain,
  enableMutations,
  setSnackSuccessMessage,
  setSnackErrorMessage,
  collapsed,
  setCollapsed,
  refetchDomainsCallback,
}: DomainCollapsibleRowProps) => {
  const theme = useTheme()

  const workspaceInfo = useWorkspaceInfo()

  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)
  const [showReAddDNSDialog, setShowReaddDNSDialog] = useState(false)

  const [deleteVerifiedDomain] = useMutation<
    DeleteVerifiedDomain,
    DeleteVerifiedDomainVariables
  >(DELETE_VERIFIED_DOMAIN_MUTATION, {
    onCompleted: (data) => {
      refetchDomainsCallback()
      setSnackSuccessMessage(
        `Domain ${data.deleteVerifiedDomain.domain} deleted`
      )
    },
    onError: (error) => {
      setSnackErrorMessage(error.message)
    },
  })

  const [
    performVerification,
    { reset: resetPerformVerification, loading: isVerifyingDomain },
  ] = useMutation<PerformVerification, PerformVerificationVariables>(
    PERFORM_VERIFICATION_MUTATION,
    {
      onCompleted: () => {
        refetchDomainsCallback()
        setSnackSuccessMessage('Domain verified successfully')
        resetPerformVerification()
      },
      onError: (error) => {
        setSnackErrorMessage(error.message)
      },
    }
  )

  return (
    <>
      <Card>
        <MenuItem
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            padding: 2,
          }}
        >
          <ListItemText
            primary={
              <Typography fontWeight="bold">{verifiedDomain.domain}</Typography>
            }
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <DomainVerifiedChip verified={verifiedDomain.verified} />
            {collapsed ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </Stack>
        </MenuItem>
        <Collapse in={!collapsed} timeout="auto">
          <Divider />
          <Stack
            sx={{
              padding: 2,
            }}
            spacing={2}
          >
            {!verifiedDomain.verified && (
              <>
                <Typography color={theme.palette.error.main}>
                  This domain is not verified. Please add this TXT record to
                  your DNS to the root (@ or {verifiedDomain.domain}) to do so.
                </Typography>
                <CopyBox
                  text={verifiedDomain.txtRecord}
                  onCopy={() =>
                    setSnackSuccessMessage('Copied record to clipboard')
                  }
                />
                <Box>
                  {enableMutations ? (
                    <Button
                      variant="contained"
                      onClick={() =>
                        performVerification({
                          variables: {
                            verifiedDomainId: verifiedDomain.id,
                            teamId:
                              workspaceInfo?.scope?.variant === 'TEAM'
                                ? workspaceInfo.scope.variantTargetId
                                : null,
                          },
                        })
                      }
                      disabled={isVerifyingDomain}
                    >
                      Verify Domain
                    </Button>
                  ) : (
                    <Tooltip title="You must be an admin or owner to perform this action">
                      <span>
                        <Button variant="contained" disabled>
                          Verify Domain
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                </Box>
              </>
            )}
            <Stack spacing={2} justifyContent="flex-end" direction="row">
              {verifiedDomain.verified && (
                <Button
                  color="info"
                  onClick={() => setShowReaddDNSDialog(true)}
                >
                  Re-add Records
                </Button>
              )}
              {enableMutations ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setShowQueryDeleteDialog(true)}
                >
                  Delete Domain
                </Button>
              ) : (
                <Tooltip title="You must be an admin or owner to perform this action">
                  <span>
                    <Button variant="contained" color="error" disabled>
                      Delete Domain
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </Collapse>
      </Card>
      <QueryDeleteDialog
        show={showQueryDeleteDialog}
        onClose={() => setShowQueryDeleteDialog(false)}
        title="Delete domain?"
        description="Are you sure you want to delete this domain? This action cannot be undone. Please remember to remove any DNS records from your domain provider."
        onDelete={() =>
          deleteVerifiedDomain({
            variables: {
              verifiedDomainId: verifiedDomain.id,
              teamId:
                workspaceInfo?.scope.variant === 'TEAM'
                  ? workspaceInfo?.scope.variantTargetId
                  : null,
            },
          })
        }
      />
      <Dialog
        open={showReAddDNSDialog}
        onClose={() => setShowReaddDNSDialog(false)}
      >
        <DialogTitle>Re-add DNS Records</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <FormHelperText>
              Please add this TXT record to your DNS to the root (@ or{' '}
              {verifiedDomain.domain}) to verify this domain.
            </FormHelperText>
            <CopyBox
              text={verifiedDomain.txtRecord}
              onCopy={() =>
                setSnackSuccessMessage('Copied record to clipboard')
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReaddDNSDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
