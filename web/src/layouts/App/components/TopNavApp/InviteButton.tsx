import { useMemo } from 'react'

import { Button } from '@mui/material'

import { navigate, routes, useLocation } from '@redwoodjs/router'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

export const InviteButton = () => {
  const workspaceInfo = useWorkspaceInfo()

  const { pathname } = useLocation()

  const showButton = useMemo(() => {
    if (workspaceInfo?.scope?.variant !== 'TEAM') return false
    if (pathname === routes.settingsWorkspaceMembers()) return false
    if (workspaceInfo?.scope?.role === 'OWNER') return true
    if (workspaceInfo?.scope?.role === 'ADMIN') return true

    return false
  }, [workspaceInfo, pathname])

  if (!showButton) return <></>

  return (
    <Button
      size="small"
      variant="contained"
      color="primary"
      sx={{
        padding: 0,
        height: '28px',
        maxWidth: '58px',

        // ake font bold
        fontWeight: 600,
        fontSize: '0.75rem',
      }}
      onClick={() => navigate(routes.settingsWorkspaceMembers())}
    >
      Invite
    </Button>
  )
}
