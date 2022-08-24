import React from 'react'

import { Box, Stack, Paper, Typography, useTheme } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'

import ThemeModeToggler from 'src/components/ThemeModeToggler'

type TopNavProps = {
  disableTop?: boolean
}

const TopNav = ({ disableTop = false }: TopNavProps) => {
  const theme = useTheme()
  const { isAuthenticated } = useAuth()

  return (
    <Paper
      sx={{
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
        // For consistency with fix in landing TopNav
        marginY: '-0.5px',
        backgroundColor: theme.palette.background.paper,
        // Prevent app bar form changing color by applying desired linearGradien
        // all the time
        backgroundImage: disableTop
          ? undefined
          : 'linear-gradient(rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12))',
      }}
      elevation={disableTop ? 0 : 8}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          paddingY: 2,
        }}
      >
        <Box></Box>
        <Stack direction="row" alignItems="center" spacing={2} marginRight={2}>
          <Box>
            <ThemeModeToggler />
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default TopNav
