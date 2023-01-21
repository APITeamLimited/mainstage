import { Stack, useTheme, Typography } from '@mui/material'

import {
  mediumPanelSpacing,
  smallPanelSpacing,
} from 'src/layouts/Landing/components/constants'

const darkImage = require('public/img/splash/global-testing-network-dark.png')
const lightImage = require('public/img/splash/global-testing-network-light.png')

export const GlobalTestingNetwork = () => {
  const theme = useTheme()

  return (
    <Stack spacing={mediumPanelSpacing} alignItems="center">
      <Stack spacing={smallPanelSpacing} alignItems="center">
        <Typography variant="h2" fontWeight="bold">
          <span style={{ color: theme.palette.primary.main }}>
            Global Testing
          </span>{' '}
          Network
        </Typography>
        <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
          Send requests and run distributed load tests from 19 locations around
          the world with our global testing network.
        </Typography>
      </Stack>
      <img
        src={theme.palette.mode === 'dark' ? darkImage : lightImage}
        style={{ width: '100%' }}
        alt="Global Testing Network"
      />
    </Stack>
  )
}
