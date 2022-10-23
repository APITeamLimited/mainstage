import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Card,
  Divider,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import {
  ListPendingInvitations,
  ListPendingInvitationsVariables,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { MEMBERS_CARD_HEIGHT } from '../MembersSettingsPage'

import { ManageInvitationRow } from './ManageInvitationRow'

type ManagePendingInvitationsProps = {
  teamId: string
  invitionsSentCount: number
}

const LIST_PENDING_INVITATIONS = gql`
  query ListPendingInvitations($teamId: String!) {
    invitations(teamId: $teamId) {
      id
      createdAt
      updatedAt
      email
      teamId
      role
    }
  }
`

export const ManagePendingInvitations = ({
  teamId,
  invitionsSentCount,
}: ManagePendingInvitationsProps) => {
  const theme = useTheme()

  const { data, error, refetch } = useQuery<
    ListPendingInvitations,
    ListPendingInvitationsVariables
  >(LIST_PENDING_INVITATIONS, {
    variables: { teamId },
    pollInterval: 5000,
  })

  useEffect(() => {
    refetch()
  }, [invitionsSentCount, refetch])

  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )

  if (error) {
    return (
      <Card
        sx={{
          minHeight: MEMBERS_CARD_HEIGHT,
        }}
      >
        <Box
          sx={{
            height: MEMBERS_CARD_HEIGHT,
          }}
        >
          <Stack
            spacing={2}
            sx={{ p: 2, height: '100%' }}
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h6" color={theme.palette.error.main}>
              Error loading pending invitations
            </Typography>
          </Stack>
        </Box>
      </Card>
    )
  }

  if (!data) return <Skeleton width="100%" height={MEMBERS_CARD_HEIGHT} />

  return (
    <>
      <Snackbar
        open={!!snackErrorMessage}
        onClose={() => setSnackErrorMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackErrorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!snackSuccessMessage}
        onClose={() => setSnackSuccessMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackSuccessMessage}
        </Alert>
      </Snackbar>
      <Card
        sx={{
          minHeight: MEMBERS_CARD_HEIGHT,
        }}
      >
        {data.invitations.length === 0 ? (
          <Box
            sx={{
              height: MEMBERS_CARD_HEIGHT,
            }}
          >
            <Stack
              spacing={2}
              sx={{ p: 2, height: '100%' }}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h6" color="textPrimary">
                No pending invitations yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                When you invite someone to your team, they will appear here
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Stack
            spacing={2}
            sx={{
              p: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Pending Invitations
            </Typography>
            <Divider />
            {data.invitations.map((invitation, index) => (
              <ManageInvitationRow
                key={index}
                invitation={invitation}
                teamId={teamId}
                refetch={refetch}
                setSnackSuccessMessage={setSnackSuccessMessage}
                setSnackErrorMessage={setSnackErrorMessage}
              />
            ))}
          </Stack>
        )}
      </Card>
    </>
  )
}
