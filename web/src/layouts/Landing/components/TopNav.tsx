import React from 'react'

import { Box, Container, Typography, useTheme } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'

import ThemeModeToggler from 'src/components/ThemeModeToggler'

const TopNav = () => {
  const theme = useTheme()
  const { isAuthenticated } = useAuth()

  return  (
    <Container sx={{
      // Fix for text from body visible above TopNav on Chrome Windows
      marginY: '-0.5px',
    }}>
      <Box
        position='relative'
        zIndex={theme.zIndex.appBar - 1}
        sx={{
          paddingY: 2,
        }}
      >
        <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
          <Box marginRight={2}>
            <Link
              to={routes.login()}
              style={{
                textDecoration: 'none',
                color: theme.palette.text.primary,
              }}
            >
              <Typography variant={'body1'}>Support</Typography>
            </Link>
          </Box>
          {!isAuthenticated && (
            <Box marginRight={2}>
              <Link
                to={routes.login()}
                style={{
                  textDecoration: 'none',
                  color: theme.palette.text.primary,
                }}
              >
                <Typography variant={'body1'}>Login</Typography>
              </Link>
            </Box>
          )}
          <Box>
            <ThemeModeToggler />
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default TopNav
