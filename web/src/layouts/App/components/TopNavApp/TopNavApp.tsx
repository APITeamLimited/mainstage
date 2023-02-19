import { ROUTES } from '@apiteam/types'
import { Stack } from '@mui/material'

import { APITeamLogo } from 'src/components/APITeamLogo'
import { PlanChip } from 'src/components/app/utils/PlanChip'
import { TopNavLink } from 'src/components/utils/TopNavLink'
import { usePlanInfo } from 'src/contexts/billing-info'
import { TopNavBase } from 'src/layouts/TopNavBase'

import { InviteButton } from './InviteButton'
import { WorkspaceSwitcher } from './WorkspaceOverview'

export const TopNavApp = () => {
  const planInfo = usePlanInfo()

  return (
    <TopNavBase
      leftZone={
        <Stack
          direction="row"
          alignItems="center"
          spacing={4}
          sx={{
            height: '100%',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <APITeamLogo />
            {planInfo && <PlanChip name={planInfo.name} hideIfFree />}
          </Stack>
          {/* {!isOnDashboard && (
            <TopNavLink name="Dashboard" path={ROUTES.dashboard} />
          )} */}
          <TopNavLink name="Docs" path={ROUTES.docs} />
          <TopNavLink name="Support" path={ROUTES.contact} />
        </Stack>
      }
      rightZone={
        <>
          <InviteButton />
          <WorkspaceSwitcher />
        </>
      }
    />
  )
}
