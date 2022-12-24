import { LINKS } from '@apiteam/types/src'
import GitHubIcon from '@mui/icons-material/GitHub'
import { Box, Button, Stack, Typography, useTheme } from '@mui/material'

import { smallPanelSpacing } from 'src/layouts/Landing/components/constants'

const messages = [
  'APITeam Agent allows you to send requests and run load tests from your local machine and stream the results to the APITeam platform.',
  'APITeam Agent uses GlobeTest under the hood, enabling load testing from your local machine with minimal setup.',
]

export const AgentOSS = () => {
  const theme = useTheme()

  return (
    <Stack spacing={smallPanelSpacing}>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        color={theme.palette.text.primary}
      >
        APITeam Agent
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
          onClick={() => window.open(LINKS.agentRepo, '_blank')}
          endIcon={<GitHubIcon />}
        >
          View APITeam Agent on GitHub
        </Button>
      </Box>
    </Stack>
  )
}
