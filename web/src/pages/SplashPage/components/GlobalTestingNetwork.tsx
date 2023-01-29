import {
  Stack,
  useTheme,
  Typography,
  Container,
  Box,
  alpha,
} from '@mui/material'

import {
  mediumPanelSpacing,
  panelSeparation,
  smallPanelSpacing,
} from 'src/layouts/Landing/components/constants'
import { ThemeInverter } from 'src/utils/ThemeInverter'

const darkImage = require('public/img/splash/global-testing-network-dark.png')

export const GlobalTestingNetwork = () => {
  return (
    <ThemeInverter forceMode="dark">
      <GlobalTestingNetworkInner />
    </ThemeInverter>
  )
}

const GlobalTestingNetworkInner = () => {
  const theme = useTheme()

  return (
    <Stack
      spacing={panelSeparation}
      sx={{
        backgroundColor: theme.palette.background.paper,
        width: '100%',
      }}
    >
      <Box
        sx={{
          background: `radial-gradient(circle at 50% 50%,${alpha(
            theme.palette.primary.main,
            0.1
          )}, ${alpha(theme.palette.primary.main, 0.0)})`,
          paddingY: panelSeparation,
        }}
      >
        <Container>
          <Stack spacing={mediumPanelSpacing} alignItems="center">
            <Stack spacing={smallPanelSpacing} alignItems="center">
              <Typography
                variant="h1"
                fontWeight="bold"
                sx={{ color: theme.palette.text.primary }}
              >
                <span
                  style={{
                    color: theme.palette.primary.main,
                    background: `linear-gradient(180deg, transparent 82%, ${alpha(
                      theme.palette.secondary.main,
                      0.3
                    )} 0%)`,
                  }}
                >
                  Global Testing
                </span>{' '}
                Network
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.secondary }}
              >
                Send requests and run distributed load tests from 29 locations
                around the world with our global testing network.
              </Typography>
            </Stack>
            <img
              src={darkImage}
              style={{ width: '100%' }}
              alt="Global Testing Network"
            />
          </Stack>
        </Container>
      </Box>
    </Stack>
  )
}
