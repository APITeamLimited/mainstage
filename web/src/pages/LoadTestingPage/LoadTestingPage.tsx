import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'
import { ImageTextPanel } from 'src/layouts/Landing/components/templates/ImageTextPanel'
import { extendedGlobeTestFeatures } from 'src/layouts/Landing/content/globe-test-features'

const title = 'Load Testing'
const descriptions = [
  'Load test your APIs with our integrated open source load testing tool GlobeTest.',
  ' Easily create and run load tests, viewing the results in real-time.',
]

const LoadTestingPage = () => (
  <>
    <MetaTags title={title} description={descriptions.join(' ')} />
    <Headline headline={title} sublines={descriptions} />
    <Stack
      spacing={panelSeparation}
      sx={{
        paddingY: panelSeparation,
      }}
    >
      {extendedGlobeTestFeatures.map((feature, index) => (
        <ImageTextPanel
          key={index}
          title={feature.title}
          description={feature.description}
          image={feature.image}
          alignment={index % 2 === 0 ? 'left' : 'right'}
        />
      ))}
      {/*
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
            color={theme.palette.text.primary}
            gutterBottom
          >
            Integrated load testing of your APIs
          </Typography>
          <Typography
            sx={{
              color: theme.palette.text.secondary,
              marginBottom: 2,
            }}
            variant="h6"
          >
            Load test your APIs with our integrated open source load testing tool GlobeTest.
            Easily create and run load tests, and view the results in real-time.
          </Typography>
          <CallToClickLink
            text="Load testing with APITeam"
            link={ROUTES.loadTesting}
          />
        </Box>
        */}
    </Stack>
  </>
)

export default LoadTestingPage
