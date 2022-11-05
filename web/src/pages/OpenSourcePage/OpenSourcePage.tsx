import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'

import { GlobeTestOSS } from './components/GlobeTestOSS'

const title = 'Open Source'

const description = 'APITeam proudly supports open source software.'

const OpenSourcePage = () => (
  <>
    <MetaTags title={title} description={description} />
    <Headline headline={title} sublines={[description]} padBottom />
    <Stack spacing={panelSeparation}>
      <GlobeTestOSS />
    </Stack>
  </>
)

export default OpenSourcePage
