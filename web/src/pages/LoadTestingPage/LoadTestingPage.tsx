import { ROUTES } from '@apiteam/types'
import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'
import { ImageTextPanel } from 'src/layouts/Landing/components/templates/ImageTextPanel'
import { LandingNextSectionLink } from 'src/layouts/Landing/components/templates/LandingNextSectionLink'
import { extendedGlobeTestFeatures } from 'src/layouts/Landing/content/globe-test-features'

const title = 'Load Testing'
const descriptions = [
  'Load test your APIs with our integrated open source load testing tool GlobeTest.',
  ' Easily create and run load tests, viewing the results in real-time.',
]

const LoadTestingPage = () => (
  <>
    <MetaTags title={title} description={descriptions.join(' ')} />
    <Headline headline={title} sublines={descriptions} padBottom />
    <Stack spacing={panelSeparation}>
      {extendedGlobeTestFeatures.map((feature, index) => (
        <ImageTextPanel
          key={index}
          title={feature.title}
          description={feature.description}
          image={feature.image}
          alignment={index % 2 === 0 ? 'left' : 'right'}
        />
      ))}
      <LandingNextSectionLink
        primaryText="Load testing from your local machine"
        secondaryText="Load test your APIs as you develop them. Run load tests from your local machine with APITeam Agent and stream the results to the cloud."
        callToClickLink={{
          text: 'Learn more and download',
          link: ROUTES.agent,
        }}
      />
    </Stack>
  </>
)

export default LoadTestingPage
