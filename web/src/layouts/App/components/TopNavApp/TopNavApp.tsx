import { Stack } from '@mui/material'

import { routes } from '@redwoodjs/router'

import { TopNavLink } from 'src/components/utils/TopNavLink'
import { TopNavBase } from 'src/layouts/TopNavBase'

import { APITeamLogo } from '../../../../components/APITeamLogo'

import { OnlineMembers } from './OnlineMembers'
import { WorkspaceSwitcher } from './WorkspaceSwitcher/index'

export const TopNavApp = () => {
  return (
    <TopNavBase
      leftZone={
        <Stack direction="row" alignItems="center" spacing={2}>
          <APITeamLogo />
          {/*<SlashDivider />*/}
          <WorkspaceSwitcher />
          {/*pathname === routes.collectionEditor() && (
            <CollectionEditorNavExtension />
          )*/}
        </Stack>
      }
      rightZone={
        <>
          <OnlineMembers />
          {/*
          <TopNavLink name="Support" path={routes.supportCenter()} />
          <TopNavLink name="Docs" path={routes.docs()} />*/}
        </>
      }
    />
  )
}
