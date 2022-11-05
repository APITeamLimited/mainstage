import { LINKS } from '@apiteam/types/src'
import GitHubIcon from '@mui/icons-material/GitHub'
import { Box, Button, Stack, Typography, useTheme } from '@mui/material'

import { smallPanelSpacing } from 'src/layouts/Landing/components/constants'

const messages = [
  'To build our load testing tool, we built on top of the open source project K6. We have implemented a number of features that we believe will make load testing easier for developers and are proud to share them with the community.',
  'We built GlobeTest to provide a simple way to run distributed load tests using the K6 runtime engine.',
  'A further aim is to provide simultanous concurrent execution of multiple load tests, minimising costs associated with running load tests.',
]

export const GlobeTestOSS = () => {
  const theme = useTheme()

  return (
    <Stack spacing={smallPanelSpacing}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        color={theme.palette.text.primary}
      >
        GlobeTest
      </Typography>
      {messages.map((message, index) => (
        <Typography
          key={index}
          sx={{
            color: theme.palette.text.secondary,
          }}
          variant="h6"
        >
          {message}
        </Typography>
      ))}
      <Box>
        <Button
          variant="outlined"
          onClick={() => window.open(LINKS.globeTestRepo, '_blank')}
          endIcon={<GitHubIcon />}
        >
          View GlobeTest on GitHub
        </Button>
      </Box>
    </Stack>
  )
}
