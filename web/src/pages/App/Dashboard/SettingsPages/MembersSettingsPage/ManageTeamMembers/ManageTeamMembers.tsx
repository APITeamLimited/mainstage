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
import {
  ListTeamMembers,
  ListTeamMembersVariables,
  ScopeRole,
} from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { MEMBERS_CARD_HEIGHT } from '../MembersSettingsPage'

import { MemberRow } from './MemberRow'

export const LIST_TEAM_MEMBERS = gql`
  query ListTeamMembers($teamId: String!) {
    memberships(teamId: $teamId) {
      id
      user {
        id
        firstName
        lastName
        email
        profilePicture
      }
      teamId
      role
      createdAt
      updatedAt
    }
  }
`

type ManageTeamMembersProps = {
  teamId: string
}

export const ManageTeamMembers = ({ teamId }: ManageTeamMembersProps) => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()

  const userRole = useMemo(
    () => workspaceInfo?.scope?.role || null,
    [workspaceInfo]
  )

  const { data, error } = useQuery<ListTeamMembers, ListTeamMembersVariables>(
    LIST_TEAM_MEMBERS,
    {
      variables: { teamId },
      pollInterval: 5000,
    }
  )

  if (!userRole) return null

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
              Error loading members
            </Typography>
          </Stack>
        </Box>
      </Card>
    )
  }

  if (!data) return <Skeleton width="100%" height={MEMBERS_CARD_HEIGHT} />

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
        {data.memberships.map((membership, index) => (
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
