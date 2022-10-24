import { useMemo, useEffect, useState } from 'react'

import { useTheme, Box, Typography, Stack, LinearProgress } from '@mui/material'
import TextTransition, { presets } from 'react-text-transition'

import { APITeamLogo } from 'src/components/APITeamLogo'

const loadingMessages = [
  'Polishing POST requests',
  'Checking for bugs',
  'Plumbing websockets',
  'Sketching graphql schemas',
  'Organising metrics',
  'Deriving execution plans',
  'Reticulating splines',
  'Generating API keys',
  'Solving the halting problem',
]

export const LoadingScreen = () => {
  const theme = useTheme()

  const loadingMessagesRandomOrder = useMemo(() => {
    const copy = [...loadingMessages]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((messageIndex + 1) % loadingMessagesRandomOrder.length)
    }, 3000)

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
    // Show handled in loadingMessagesRandomOrder dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIndex])

  return (
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
          // Looks better slightly higher up on the screen
          paddingBottom: '200px',
        }}
      >
        <APITeamLogo height="100px" disableLinks />
        <Typography variant="h6" color={theme.palette.text.secondary}>
          <TextTransition
            springConfig={presets.default}
            style={{
              // Align text to the center
              whiteSpace: 'nowrap',
              textAlign: 'center',
              display: 'inline-block',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loadingMessagesRandomOrder[messageIndex]}
          </TextTransition>
        </Typography>

        <Box sx={{ width: '50vw', maxWidth: 500 }}>
          <LinearProgress
            sx={{
              height: 6,
            }}
          />
        </Box>
      </Stack>
    </Box>
  )
}
