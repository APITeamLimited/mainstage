import { useMemo, useEffect, useState } from 'react'

import { useTheme, Box, Typography, Stack, LinearProgress } from '@mui/material'
import TextTransition, { presets } from 'react-text-transition'

const loadingMessages = [
  'Polishing post requests',
  'Checking for bugs',
  'Warming up the API',
  'Plumbing websockets',
  'Sketching graphql schemas',
  'Organising metrics',
  'Serving up some docs',
  'Reticulating splines',
]

type LoadingScreenProps = {
  show: boolean
  children?: React.ReactNode
}

export const LoadingScreen = ({ show, children }: LoadingScreenProps) => {
  const theme = useTheme()

  const loadingMessagesRandomOrder = useMemo(() => {
    const copy = [...loadingMessages]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }, [])

  const [messageIndex, setMessageIndex] = useState(0)

  const [textInterval, setTextInterval] = useState<number | null>(null)

  useEffect(() => {
    if (!show) {
      if (textInterval) {
        window.clearInterval(textInterval as number)
        setTextInterval(null)
      }
      return
    }

    if (!textInterval) {
      const interval = window.setInterval(() => {
        setMessageIndex((messageIndex + 1) % loadingMessagesRandomOrder.length)
      }, 3000)
      setTextInterval(interval)
    }

    return () => {
      if (textInterval) {
        clearInterval(textInterval)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIndex, show, textInterval])

  return (
    <>
      {show && (
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
          <Stack spacing={4} alignItems="center">
            <Typography
              fontSize={80}
              fontWeight={1000}
              // The old theme's font, think this might look better for the logo
              fontFamily="Roboto"
              color={theme.palette.text.primary}
            >
              <span
                style={{
                  whiteSpace: 'nowrap',
                }}
              >
                API Team
              </span>
            </Typography>
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
      )}
      {children}
    </>
  )
}
