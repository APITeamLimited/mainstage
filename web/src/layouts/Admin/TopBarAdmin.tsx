import React from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import { Container, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

import { APITeamLogo } from 'src/components/APITeamLogo'

interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSidebarOpen: () => void
}

const TopBarAdmin = ({ onSidebarOpen }: Props): JSX.Element => {
  const theme = useTheme()

  return (
    <Container
      sx={{
        py: 2,
      }}
    >
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width={1}
      >
        <Box
          sx={{
            width: {
              xs: 100,
              sm: 120,
            },
          }}
        >
          <Link
            to={routes.splash()}
            style={{
              textDecoration: 'none',
              color: theme.palette.text.primary,
            }}
          >
            <APITeamLogo />
          </Link>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems={'center'}>
          <Typography variant={'h6'} color={'textPrimary'}>
            Admin
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'flex', md: 'none' } }} alignItems={'center'}>
          <Button
            onClick={() => onSidebarOpen()}
            aria-label="Menu"
            variant={'outlined'}
            sx={{
              borderRadius: 2,
              minWidth: 'auto',
              padding: 1,
              borderColor: alpha(theme.palette.divider, 0.2),
            }}
          >
            <MenuIcon />
          </Button>
        </Box>
      </Box>
    </Container>
  )
}

export default TopBarAdmin
