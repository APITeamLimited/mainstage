import { useMemo } from 'react'

import {
  Box,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { ScopeRole } from 'types/graphql'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useMembersInfo } from '../MembersInfoProvider'
import { MEMBERS_CARD_HEIGHT } from '../MembersSettingsPage'

import { MemberRow } from './MemberRow'

export const ManageTeamMembers = () => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()

  const userRole = useMemo(
    () => workspaceInfo?.scope?.role || null,
    [workspaceInfo]
  )

  const { membersData, membersError } = useMembersInfo()

  if (!userRole) return null

  if (membersError) {
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
              Error loading members
            </Typography>
          </Stack>
        </Box>
      </Card>
    )
  }

  if (!membersData)
    return <Skeleton width="100%" height={MEMBERS_CARD_HEIGHT} />

  return (
    <Card
      sx={{
        minHeight: MEMBERS_CARD_HEIGHT,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          p: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Team Members
        </Typography>
        <Divider />
        {membersData.memberships.map((membership, index) => (
          <MemberRow
            key={index}
            membership={membership}
            userRole={userRole as ScopeRole}
            currentUserId={workspaceInfo.scope.userId}
          />
        ))}
      </Stack>
    </Card>
  )
}
