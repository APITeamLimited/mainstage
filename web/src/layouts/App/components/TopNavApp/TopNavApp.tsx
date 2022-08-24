import { Stack } from '@mui/material'

import { TopNavBase } from 'src/layouts/TopNavBase'

import { APITeamLogo } from '../../../../components/APITeamLogo'

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
    />
  )
}
