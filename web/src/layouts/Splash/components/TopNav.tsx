import React from 'react'

import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { Link, routes } from '@redwoodjs/router'

import ThemeModeToggler from 'src/components/ThemeModeToggler'

const TopNav = () => {
  const theme = useTheme()

  return (
    <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
      <Box marginRight={{ xs: 1, sm: 2 }}>
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
      <Box marginRight={{ xs: 1, sm: 2 }}>
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
      <Box>
        <ThemeModeToggler />
      </Box>
    </Box>
  )
}

export default TopNav
