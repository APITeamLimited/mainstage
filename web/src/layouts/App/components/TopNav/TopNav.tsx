import { Box, Container, Paper, Stack, useTheme } from '@mui/material'

import ThemeModeToggler from 'src/components/ThemeModeToggler'

import { APITeamLogo } from '../APITeamLogo'
import { UserDropdown } from '../UserDropdown'

import { SlashDivider } from './SlashDivider'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

export const TopNav = () => {
  const theme = useTheme()

  return (
    <Paper
      sx={{
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
      }}
      elevation={8}
    >
      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            paddingY: 0.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <APITeamLogo />
            <SlashDivider />
            <WorkspaceSwitcher />
          </Stack>
          <Box>
            <Stack direction="row" alignItems="center" spacing={2}>
              <ThemeModeToggler />
              <UserDropdown />
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Paper>
  )
}
