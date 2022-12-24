import { ROUTES } from '@apiteam/types/src'
import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'
import { ImageTextPanel } from 'src/layouts/Landing/components/templates/ImageTextPanel'
import { LandingNextSectionLink } from 'src/layouts/Landing/components/templates/LandingNextSectionLink'
import { extendedApiClientFeatures } from 'src/layouts/Landing/content/api-client-features'

const title = 'API Client'
const descriptions = [
  'Our real-time, cross-platform web based editor is free to use for an unlimited number of users.',
  'All work is automatically saved to the cloud.',
]

const APIClientPage = () => (
  <>
    <MetaTags title={title} description={descriptions.join(' ')} />
    <Headline headline={title} sublines={descriptions} padBottom />
    <Stack spacing={panelSeparation}>
      {extendedApiClientFeatures.map((feature, index) => (
        <ImageTextPanel
          key={index}
          title={feature.title}
          description={feature.description}
          image={feature.image}
          alignment={index % 2 === 0 ? 'left' : 'right'}
        />
      ))}
      <LandingNextSectionLink
        primaryText="Integrated load testing of your APIs"
        secondaryText="Load test your APIs with our integrated load testing tool GlobeTest. Easily create and run load tests, and view the results in real-time."
        callToClickLink={{
          text: 'Learn more about load testing with APITeam',
          link: ROUTES.loadTesting,
        }}
      />
    </Stack>
  </>
)

export default APIClientPage
