import { Box, Typography, useTheme } from '@mui/material'

import { useLocation, routes, Link } from '@redwoodjs/router'

export const APITeamLogo = () => {
  const { pathname } = useLocation()
  const theme = useTheme()
  const isInApp = pathname.includes('/app')

  const inner = (
    <Typography
      fontSize={22}
      fontWeight={1000}
      color={theme.palette.text.primary}
      sx={{
        userSelect: 'none',
      }}
    >
      <span
        style={{
          whiteSpace: 'nowrap',
        }}
      >
        API Team
      </span>
    </Typography>
  )

  return (
    <Link
      to={isInApp ? routes.dashboard() : routes.splash()}
      style={{
        textDecoration: 'none',
        color: theme.palette.text.primary,
      }}
    >
      {inner}
    </Link>
  )
}
