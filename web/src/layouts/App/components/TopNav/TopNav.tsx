import { Box, Paper, Stack } from '@mui/material'

import { routes } from '@redwoodjs/router'
import { useLocation } from '@redwoodjs/router'

import ThemeModeToggler from 'src/components/ThemeModeToggler'

import { APITeamLogo } from '../APITeamLogo'
import { UserDropdown } from '../UserDropdown'

import { CollectionEditorNavExtension } from './CollectionEditorNavExtension'
import { SlashDivider } from './SlashDivider'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

export const TopNav = () => {
  const { pathname } = useLocation()

  return (
    <Paper
      sx={{
        borderRadius: 0,
        boxShadow: 'none',
        border: 'none',
        // For consistency with fix in landing TopNav
        marginY: '-0.5px'
      }}
      elevation={8}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          paddingY: 0.5,
          paddingX: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <APITeamLogo />
          {/*<SlashDivider />*/}
          <WorkspaceSwitcher />
          {/*pathname === routes.collectionEditor() && (
            <CollectionEditorNavExtension />
          )*/}
        </Stack>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ThemeModeToggler />
            <UserDropdown />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  )
}
