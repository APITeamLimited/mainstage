import { useMemo } from 'react'

import { LINKS } from '@apiteam/types/src'
import AppleIcon from '@mui/icons-material/Apple'
import {
  Button,
  ButtonProps,
  Grid,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import { LinuxIcon, WindowsIcon } from 'src/components/utils/Icons'
import {
  mediumPanelSpacing,
  smallPanelSpacing,
} from 'src/layouts/Landing/components/constants'

import { DownloadLinkItem } from './DownloadLinkItem'

export const DownloadLinks = () => {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  const os = useMemo(() => {
    const userAgent = navigator.userAgent

    if (userAgent.includes('Mac')) {
      return 'mac'
    }

    if (userAgent.includes('Windows')) {
      return 'windows'
    }

    if (userAgent.includes('Linux')) {
      return 'linux'
    }

    return 'unknown'
  }, [])

  return (
    <Stack spacing={mediumPanelSpacing} alignItems="center">
      <Stack spacing={smallPanelSpacing} alignItems="center">
        <Typography variant="h2" fontWeight="bold">
          Download APITeam Agent
        </Typography>
        <Typography variant="h6" color={theme.palette.text.secondary}>
          Get the latest version of APITeam Agent for your OS
        </Typography>
      </Stack>
      <Grid
        container
        spacing={4}
        sx={{
          width: '100%',
        }}
        alignItems="stretch"
      >
        <DownloadLinkItem
          platformName="Windows"
          platformIcon={WindowsIcon}
          description="Download the latest version of the APITeam Agent for Windows"
          isSmall={isSmall}
          isFirstChild
          inverted={os === 'windows'}
        >
          <span>
            <InvertedButton
              color="primary"
              size="large"
              inverted={os === 'windows'}
            >
              Windows 64-bit
            </InvertedButton>
          </span>
        </DownloadLinkItem>
        <DownloadLinkItem
          platformName="Mac"
          platformIcon={AppleIcon}
          description="Download the latest version of the APITeam Agent for Mac"
          isSmall={isSmall}
          inverted={os === 'mac'}
        >
          <Stack spacing={4} direction="row">
            <InvertedButton
              color="primary"
              size="large"
              inverted={os === 'mac'}
            >
              Intel Chip
            </InvertedButton>
            <InvertedButton
              color="primary"
              size="large"
              inverted={os === 'mac'}
            >
              Apple Chip
            </InvertedButton>
          </Stack>
        </DownloadLinkItem>
        <DownloadLinkItem
          platformName="Linux"
          platformIcon={LinuxIcon}
          description="Download the latest version of the APITeam Agent for Linux from the Snap Store"
          isSmall={isSmall}
          inverted={os === 'linux'}
        >
          <span>
            <InvertedButton
              color="primary"
              size="large"
              inverted={os === 'linux'}
            >
              Get the Snap (64-bit)
            </InvertedButton>
          </span>
        </DownloadLinkItem>
      </Grid>
      <Typography variant="h6" color={theme.palette.text.secondary}>
        Or if you prefer, you can compile the{' '}
        <Link href={LINKS.agentRepo} target="_blank">
          source code
        </Link>{' '}
        yourself
      </Typography>
    </Stack>
  )
}

const InvertedButton = (
  props: ButtonProps & {
    inverted?: boolean
  }
) => {
  const theme = useTheme()

  const { inverted, ...rest } = props

  return (
    <Button
      {...rest}
      variant="outlined"
      sx={{
        borderColor: inverted ? theme.palette.common.white : undefined,
        color: inverted ? theme.palette.common.white : undefined,
        '&:hover': {
          borderColor: inverted ? theme.palette.common.white : undefined,
        },
      }}
    />
  )
}
