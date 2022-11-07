import { ROUTES } from '@apiteam/types/src'
import { Box, Stack, Typography, useTheme } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { CallToClickLink } from 'src/layouts/Landing/components/CallToClickLink'
import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'
import { ImageTextPanel } from 'src/layouts/Landing/components/templates/ImageTextPanel'
import { extendedApiClientFeatures } from 'src/layouts/Landing/content/api-client-features'

const title = 'API Client'
const descriptions = [
  'Our real-time, cross-platform web based editor is free to use for an unlimited number of users.',
  'All work is automatically saved to the cloud.',
]

const APIClientPage = () => {
  const theme = useTheme()

  return (
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
            Load test your APIs with our integrated open source load testing
            tool GlobeTest. Easily create and run load tests, viewing the
            results in real-time.
          </Typography>
          <CallToClickLink
            text="Learn more about load testing with APITeam"
            link={ROUTES.loadTesting}
          />
        </Box>
      </Stack>
    </>
  )
}

export default APIClientPage
