import {
  Box,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'

import { useMembersInfo } from '../MembersInfoProvider'
import { MEMBERS_CARD_HEIGHT } from '../MembersSettingsPage'

import { ManageInvitationRow } from './ManageInvitationRow'

type ManagePendingInvitationsProps = {
  teamId: string
}

export const ManagePendingInvitations = ({
  teamId,
}: ManagePendingInvitationsProps) => {
  const theme = useTheme()

  const { invitationsData, invitationsError, refetchInvitations } =
    useMembersInfo()

  if (invitationsError) {
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

  if (!invitationsData)
    return <Skeleton width="100%" height={MEMBERS_CARD_HEIGHT} />

  return (
    <Card
      sx={{
        minHeight: MEMBERS_CARD_HEIGHT,
      }}
    >
      {invitationsData.invitations.length === 0 ? (
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
          {invitationsData.invitations.map((invitation, index) => (
            <ManageInvitationRow
              key={index}
              invitation={invitation}
              teamId={teamId}
              refetch={refetchInvitations}
            />
          ))}
        </Stack>
      )}
    </Card>
  )
}
