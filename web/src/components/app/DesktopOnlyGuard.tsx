import { useEffect, useState } from 'react'

import StayCurrentPortraitIcon from '@mui/icons-material/StayCurrentPortrait'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import { useDeviceSelectors } from 'react-device-detect'

type DesktopOnlyGuardProps = {
  children: React.ReactNode
}

export const DesktopOnlyGuard = ({ children }: DesktopOnlyGuardProps) => {
  const theme = useTheme()

  const isMobile = useIsMobile()

  return isMobile ? (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        zIndex: 10000000,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <Stack
        spacing={4}
        alignItems="center"
        sx={{
          paddingX: 4,
        }}
      >
        <StayCurrentPortraitIcon
          sx={{
            height: '100px',
            width: '100px',
            color: theme.palette.text.secondary,
          }}
        />
        <Typography
          variant="h6"
          color={theme.palette.text.secondary}
          sx={{
            textAlign: 'center',
          }}
        >
          APITeam is not supported on mobile devices.
        </Typography>
        <Typography
          variant="h6"
          color={theme.palette.text.secondary}
          sx={{
            textAlign: 'center',
          }}
        >
          If you have no other choice, you can view this page in desktop mode by
          enabling desktop mode in your browser&apos;s settings.
        </Typography>
      </Stack>
    </Box>
  ) : (
    <>{children}</>
  )
}

const useIsMobile = () => {
  const [userAgent, setUserAgent] = useState(window.navigator.userAgent)

  useEffect(() => {
    const interval = setInterval(() => {
      if (userAgent !== window.navigator.userAgent) {
        setUserAgent(window.navigator.userAgent)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAgent])

  const [selectors] = useDeviceSelectors(userAgent)

  const { isMobile } = selectors

  return isMobile as boolean
}
