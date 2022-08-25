import React from 'react'

import { Link, matchPath, useLocation } from 'react-router-dom'
import { Button, Drawer, Box, useTheme, Stack, Typography } from '@mui/material'
import { APITeamLogo } from 'src/components/APITeamLogo'
import { useNavigate } from 'react-router-dom'

type SideBarAdminProps = {
  onClose: () => void
  open: boolean
  variant: 'permanent' | 'persistent' | 'temporary' | undefined
}

export const SideBarAdmin = ({
  open,
  variant,
  onClose,
}: SideBarAdminProps): JSX.Element => {
  const theme = useTheme()
  const navigate = useNavigate()

  const handleButtonClick = (tabName: string) => {
    navigate(tabName)
    onClose()
  }

  return (
    <Drawer
      anchor="left"
      onClose={() => onClose()}
      open={open}
      variant={variant}
      sx={{
        '& .MuiPaper-root': {
          width: '100%',
          maxWidth: 280,
        },
      }}
    >
      <Stack
        spacing={2}
        sx={{
          margin: 2,

        }}
      >
        <APITeamLogo />
        <Typography
          variant="h6"
          color={theme.palette.text.secondary}
          sx={{ paddingTop: 4,  paddingLeft: 1 }}
        >
          Accounts
        </Typography>
        <Box>
          <Button
            sx={{
              color: theme.palette.text.primary,

            }}
            variant="text"
            onClick={() => handleButtonClick('adminUsers')}
          >
            Users
          </Button>
        </Box>
      </Stack>
    </Drawer>
  )
}
