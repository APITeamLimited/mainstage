import { Typography, useTheme } from '@mui/material'

import { useLocation, routes, Link } from '@redwoodjs/router'

export const APITeamLogo = () => {
  const { pathname } = useLocation()
  const theme = useTheme()
  const isInApp = pathname.includes('/app')

  return (
    <Link
      to={isInApp ? routes.dashboard() : routes.splash()}
      style={{
        textDecoration: 'none',
        color: theme.palette.text.primary,
        userSelect: 'none',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        WebkitUserDrag: 'none',
      }}
    >
      <Typography
        fontSize={22}
        fontWeight={1000}
        color={theme.palette.text.primary}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          API Team
        </span>
      </Typography>
    </Link>
  )
}
