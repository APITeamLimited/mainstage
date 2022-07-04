import React, { useState, useEffect } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import { alpha, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

import { Link, useLocation } from '@redwoodjs/router'

interface Props {
  title: string
  id: string
  items: {
    path: string
    name: string
  }[]
  colorInvert?: boolean
}

const NavItem = ({
  title,
  id,
  items,
  colorInvert = false,
}: Props): JSX.Element => {
  const theme = useTheme()

  const [anchorEl, setAnchorEl] = useState(null)
  const [openedPopoverId, setOpenedPopoverId] = useState(null)
  const { pathname } = useLocation()

  const handleClick = (event, popoverId) => {
    setAnchorEl(event.target)
    setOpenedPopoverId(popoverId)
  }

  const handleClose = (): void => {
    setAnchorEl(null)
    setOpenedPopoverId(null)
  }

  const hasActiveLink = () => items.find((i) => i.path === pathname)
  const linkColor = colorInvert ? 'common.white' : 'text.primary'

  return (
    <Box>
      <Box
        display={'flex'}
        alignItems={'center'}
        aria-describedby={id}
        sx={{ cursor: 'pointer' }}
        onClick={(e) => handleClick(e, id)}
      >
        <Typography
          fontWeight={openedPopoverId === id || hasActiveLink() ? 700 : 400}
          color={linkColor}
        >
          {title}
        </Typography>
        <ExpandMoreIcon
          sx={{
            marginLeft: theme.spacing(1 / 4),
            width: 16,
            height: 16,
            transform: openedPopoverId === id ? 'rotate(180deg)' : 'none',
            color: linkColor,
          }}
        />
      </Box>
      <Popover
        elevation={4}
        id={id}
        open={openedPopoverId === id}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          '.MuiPaper-root': {
            maxWidth: items.length > 12 ? 350 : 250,
            marginTop: 2,
          },
        }}
      >
        <Stack spacing={0.5}>
          {items.map((p, i) => (
            <Link key={i} to={p.path} style={{ textDecoration: 'none' }}>
              <Box>
                <Button
                  key={i}
                  sx={{
                    color:
                      pathname === p.path
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                    backgroundColor:
                      pathname === p.path
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                    fontWeight: pathname === p.path ? 600 : 400,
                  }}
                  onClick={handleClose}
                >
                  {p.name}
                </Button>
              </Box>
            </Link>
          ))}
        </Stack>
      </Popover>
    </Box>
  )
}

export default NavItem
