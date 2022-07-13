import React from 'react'

import MenuIcon from '@mui/icons-material/Menu'
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'

import { Link, routes } from '@redwoodjs/router'

import { brandedRoutes } from 'src/Routes'

import { NavItem } from './components'

interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSidebarOpen: () => void
}

const Topbar = ({ onSidebarOpen }: Props): JSX.Element => {
  const theme = useTheme()

  return (
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
          to={routes.root()}
          style={{
            textDecoration: 'none',
            color: theme.palette.text.primary,
          }}
        >
          <Typography
            fontSize={22}
            fontWeight={1000}
            color={theme.palette.text.primary}
          >
            API Team
          </Typography>
        </Link>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' } }} alignItems={'center'}>
        {Object.keys(brandedRoutes).map((key, indexCategory) => {
          if (brandedRoutes[key].includeTopbar !== false) {
            const marginLeft = indexCategory === 0 ? 0 : 4

            return (
              <Box key={indexCategory} marginLeft={marginLeft}>
                <NavItem
                  key={indexCategory}
                  id={key}
                  title={brandedRoutes[key].name}
                  items={brandedRoutes[key].subLinks}
                />
              </Box>
            )
          }
        })}
        <Box marginLeft={4}>
          <Link
            to={routes.signup()}
            style={{
              textDecoration: 'none',
            }}
          >
            <Button variant="contained" color="primary" size="large">
              Sign Up
            </Button>
          </Link>
        </Box>
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
  )
}

export default Topbar
