import { Box } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { MetaTags } from '@redwoodjs/web'

import TeamsCell from 'src/components/TeamsCell'
import UserDropdownCell from 'src/components/UserDropdownCell'

const DashboardPage = () => {
  const { currentUser } = useAuth()

  return (
    <>
      <MetaTags
        title="APITeam | Free Unlimited Team API Development"
        description="APITeam is an all in one platform for building, testing and scaling your APIs collaboratively."
      />
    </>
  )
}

export default DashboardPage
