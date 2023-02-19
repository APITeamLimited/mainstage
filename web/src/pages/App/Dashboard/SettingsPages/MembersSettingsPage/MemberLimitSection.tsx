import { ROUTES } from '@apiteam/types'
import { Link, Stack, Typography } from '@mui/material'

import { navigate } from '@redwoodjs/router'

import { PlanChip } from 'src/components/app/utils/PlanChip'
import { usePlanInfo } from 'src/contexts/billing-info'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { useMembersInfo } from './MembersInfoProvider'

export const MemberLimitSection = () => {
  const workspaceInfo = useWorkspaceInfo()
  const planInfo = usePlanInfo()

  const { invitationsData, membersData } = useMembersInfo()

  if (
    !planInfo ||
    planInfo.maxMembers === -1 ||
    !invitationsData?.invitations ||
    !membersData?.memberships ||
    !workspaceInfo.isTeam
  ) {
    return <></>
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        As your team is on the <PlanChip name={planInfo.name} /> plan, you can
        have up to {planInfo.maxMembers} members (including you and
        invitations). You can invite{' '}
        {planInfo.maxMembers -
          membersData.memberships.length -
          invitationsData.invitations.length}{' '}
        more members.
      </Typography>
      <Typography variant="body2">
        <Link
          sx={{
            cursor: 'pointer',
          }}
          onClick={() =>
            navigate(`${ROUTES.settingsWorkspaceBilling}?showPlans=true`)
          }
        >
          Upgrade to Pro
        </Link>{' '}
        to have unlimited members.
      </Typography>
    </Stack>
  )
}
