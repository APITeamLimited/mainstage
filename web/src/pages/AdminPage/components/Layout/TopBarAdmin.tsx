import MenuIcon from '@mui/icons-material/Menu'
import { Stack, Tooltip, Typography, useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { alpha, useTheme } from '@mui/material/styles'

import { APITeamLogo } from 'src/components/APITeamLogo'
import { TopNavBase } from 'src/layouts/TopNavBase'

interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSidebarOpen: () => void
}

const TopBarAdmin = ({ onSidebarOpen }: Props): JSX.Element => {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'), {
    defaultMatches: true,
  })

  return (
    <TopNavBase
      leftZone={
        <Stack direction="row" alignItems="center" spacing={2}>
          <APITeamLogo />
          {isSmall && (
            <Tooltip title="Toggle Sidebar">
              <Box sx={{ display: 'flex' }} alignItems="center">
                <Button
                  onClick={() => onSidebarOpen()}
                  aria-label="Menu"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    minWidth: 'auto',
                    borderColor: alpha(theme.palette.divider, 0.2),
                    padding: 0,
                    height: 40,
                    width: 40,
                  }}
                >
                  <MenuIcon />
                </Button>
              </Box>
            </Tooltip>
          )}
        </Stack>
      }
      rightZone={
        <>
          <Typography
            variant="h6"
            color={theme.palette.text.primary}
            fontWeight="bold"
            sx={{
              userSelect: 'none',
            }}
          >
            Admin
          </Typography>
        </>
      }
    />
  )
}

export default TopBarAdmin
