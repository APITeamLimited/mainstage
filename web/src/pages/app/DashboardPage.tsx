import { useEffect } from 'react'

import { Box } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

const DashboardPage = () => {
  const { currentUser } = useAuth()

  return (
    <>
      <MetaTags
        title="APITeam | Free Unlimited Team API Development"
        description="APITeam is an all in one platform for building, testing and scaling your APIs collaboratively."
      />

      <Box>{currentUser.id}</Box>
    </>
  )
}

export default DashboardPage
