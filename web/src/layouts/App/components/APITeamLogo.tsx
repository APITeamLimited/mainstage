import { Box, Typography, useTheme } from '@mui/material'

import { useLocation, routes, Link } from '@redwoodjs/router'

export const APITeamLogo = () => {
  const { pathname } = useLocation()
  const theme = useTheme()
  const isOnDashboard = pathname.includes('/app/dashboard')

  const handleClick = () => {}

  const inner = (
    <Typography
      fontSize={22}
      fontWeight={1000}
      color={theme.palette.text.primary}
      sx={{
        userSelect: 'none',
      }}
    >
      API Team
    </Typography>
  )

  return (
    <Link
      to={routes.dashboard()}
      style={{
        textDecoration: 'none',
        color: theme.palette.text.primary,
      }}
    >
      {inner}
    </Link>
  )
}
