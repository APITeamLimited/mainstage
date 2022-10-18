import { useMemo } from 'react'

import { Stack, Tooltip } from '@mui/material'

import { routes, useLocation } from '@redwoodjs/router'

import { TopNavLink } from 'src/components/utils/TopNavLink'
import { TopNavBase } from 'src/layouts/TopNavBase'

import { APITeamLogo } from '../../../../components/APITeamLogo'

import { InviteButton } from './InviteButton'
import { OnlineMembers } from './OnlineMembers'
import { WorkspaceSwitcher } from './WorkspaceSwitcher/index'

export const TopNavApp = () => {
  const { pathname } = useLocation()

  const isOnDashboard = useMemo(
    () => pathname.startsWith('/app/dashboard'),
    [pathname]
  )

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
          {!isOnDashboard ? (
            <Tooltip title="Dashboard">
              <span>
                <APITeamLogo />
              </span>
            </Tooltip>
          ) : (
            <APITeamLogo />
          )}
          <TopNavLink name="Docs" path={routes.docs()} />
          <TopNavLink name="Support" path={routes.supportCenter()} />
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
