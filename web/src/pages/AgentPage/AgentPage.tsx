import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { LandingNextSectionLink } from 'src/layouts/Landing/components/templates/LandingNextSectionLink'

import { DownloadLinks } from './components/DownloadLinks'
import { InstallNotesNotice } from './components/InstallNotesNotice'
import { WhyUseAgent } from './components/WhyUseAgent'

const title = 'APITeam Agent'

const description =
  'APITeam Agent allows you to send requests and run load tests from your local machine.'

const AgentPage = () => {
  return (
    <>
      <MetaTags title={title} description={description} />
      <Stack spacing={panelSeparation}>
        <WhyUseAgent />
        <DownloadLinks />
        {/* <InstallNotesNotice /> */}
        <LandingNextSectionLink
          primaryText="Create your account for free"
          secondaryText="Create your account for free and start sending requests and running load tests from your local machine."
          callToClickLink={{
            text: 'Create your account',
            link: '/signup',
          }}
        />
      </Stack>
    </>
  )
}

export default AgentPage
