import { Box } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { MetaTags } from '@redwoodjs/web'

import TeamsCell from 'src/components/TeamsCell'
import { SyncClient } from 'src/contexts/syncer'

const DashboardPage = () => {
  const { currentUser } = useAuth()

  return (
    <>
      <MetaTags
        title="APITeam | Free Unlimited Team API Development"
        description="APITeam is an all in one platform for building, testing and scaling your APIs collaboratively."
      />
      <TeamsCell />
      <TeamsCell />
      <TeamsCell />
      <TeamsCell />
      <TeamsCell />
      <TeamsCell />
      <TeamsCell />
      <TeamsCell />
      <TeamsCell />
      <SyncClient />
      <Box>{currentUser.id}</Box>
    </>
  )
}

export default DashboardPage
