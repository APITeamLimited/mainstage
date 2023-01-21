import { useMemo } from 'react'

import { AGENT_LINKS, LINKS } from '@apiteam/types/src'
import AppleIcon from '@mui/icons-material/Apple'
import {
  Button,
  ButtonProps,
  Grid,
  Link,
  Stack,
  Tooltip,
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
              onClick={() => {
                const url = `${window.location.origin}${AGENT_LINKS.windows64.link}`
                window.open(url, '_blank')
              }}
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
          <Stack spacing={4} direction="row" alignItems="center">
            <InvertedButton
              color="primary"
              size="large"
              inverted={os === 'mac'}
              onClick={() => {
                const url = `${window.location.origin}${AGENT_LINKS.macAMD64.link}`
                window.open(url, '_blank')
              }}
            >
              Intel 64-bit
            </InvertedButton>
            <Tooltip title="Coming soon">
              <span>
                <InvertedButton
                  color="primary"
                  size="large"
                  inverted={os === 'mac'}
                  disabled
                  // onClick={() => {
                  //   const url = `${window.location.origin}${AGENT_LINKS.macARM64.link}`
                  //   window.open(url, '_blank')
                  // }}
                >
                  Apple Silicon
                </InvertedButton>
              </span>
            </Tooltip>
          </Stack>
        </DownloadLinkItem>
        <DownloadLinkItem
          platformName="Linux"
          platformIcon={LinuxIcon}
          description="Download the latest version of the APITeam Agent for Linux"
          isSmall={isSmall}
          inverted={os === 'linux'}
        >
          <Stack spacing={4} direction="row">
            <InvertedButton
              color="primary"
              size="large"
              inverted={os === 'linux'}
              onClick={() =>
                window.open(AGENT_LINKS.linux64Debian.link, '_blank')
              }
            >
              Debian 64-bit
            </InvertedButton>
            <InvertedButton
              color="primary"
              size="large"
              inverted={os === 'linux'}
              onClick={() =>
                window.open(AGENT_LINKS.linux64Binary.link, '_blank')
              }
            >
              Binary 64-bit
            </InvertedButton>
          </Stack>
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

        // Dont break words, show on new line
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    />
  )
}
