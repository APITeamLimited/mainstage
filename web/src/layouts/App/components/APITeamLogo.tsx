import { Box } from '@mui/material'

import { useLocation, routes, Link } from '@redwoodjs/router'

export const APITeamLogo = () => {
  const { pathname } = useLocation()

  const isOnDashboard = pathname.includes('/app/dashboard')

  const handleClick = () => {}

  if (!isOnDashboard) {
    return (
      <Link to={routes.dashboard()}>
        <img
          src={require('web/public/img/api-team.png')}
          height={20}
          alt="APITeam"
          typeof="png"
        />
      </Link>
    )
  }

  return (
    <Box>
      <img
        src={require('web/public/img/api-team.png')}
        height={20}
        alt="APITeam"
      />
    </Box>
  )
}
