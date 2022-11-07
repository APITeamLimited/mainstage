import { useMemo } from 'react'

import { ROUTES } from '@apiteam/types/src'
import { Stack, Tooltip } from '@mui/material'

import { routes, useLocation } from '@redwoodjs/router'

import { APITeamLogo, LOGO_DEFAULT_HEIGHT } from 'src/components/APITeamLogo'
import { TopNavLink } from 'src/components/utils/TopNavLink'
import { TopNavBase } from 'src/layouts/TopNavBase'

import { InviteButton } from './InviteButton'
import { WorkspaceSwitcher } from './WorkspaceOverview'

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
          <TopNavLink name="Docs" path={ROUTES.docs} />
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
