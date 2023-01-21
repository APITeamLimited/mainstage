import { useMemo } from 'react'

import { ROUTES } from '@apiteam/types/src'
import { Stack, Tooltip } from '@mui/material'

import { useLocation } from '@redwoodjs/router'

import { APITeamLogo, LOGO_DEFAULT_HEIGHT } from 'src/components/APITeamLogo'
import { PlanChip } from 'src/components/app/utils/PlanChip'
import { TopNavLink } from 'src/components/utils/TopNavLink'
import { usePlanInfo } from 'src/contexts/billing-info'
import { TopNavBase } from 'src/layouts/TopNavBase'

import { InviteButton } from './InviteButton'
import { WorkspaceSwitcher } from './WorkspaceOverview'

export const TopNavApp = () => {
  const { pathname } = useLocation()

  const isOnDashboard = useMemo(
    () => pathname.startsWith('/app/dashboard'),
    [pathname]
  )

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
            {!isOnDashboard ? (
              <Tooltip title="Dashboard">
                <span
                  style={{
                    height: LOGO_DEFAULT_HEIGHT,
                  }}
                >
                  <APITeamLogo />
                </span>
              </Tooltip>
            ) : (
              <APITeamLogo />
            )}
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
