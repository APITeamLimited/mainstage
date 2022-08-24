import React from 'react'
import { alpha, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type HeadlineProps = {
  headline: string
  sublines?: string[]
}

export const Headline = ({ headline, sublines = [] }: HeadlineProps) => {
  const theme = useTheme()

  const lengthSublines = sublines.length

  return (
    <Box
      sx={{
        marginY: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          '&::after': {
            position: 'absolute',
            content: '""',
            width: '30%',
            zIndex: 1,
            top: 0,
            right: 0,
            height: '100%',
            backgroundSize: '18px 18px',
            backgroundImage: `radial-gradient(${alpha(
              theme.palette.primary.dark,
              0.4
            )} 20%, transparent 20%)`,
            opacity: 0.2,
          },
        }}
      >
        <Box position="relative" zIndex={2}>
          <Typography fontWeight={600} variant="h2" gutterBottom align="center">
            {headline}
          </Typography>
          {sublines.map((subline, index) => (
            <Typography
              key={index}
              variant="h6"
              color={theme.palette.text.secondary}
              align="center"
              gutterBottom={index !== lengthSublines - 1}
            >
              {subline}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
