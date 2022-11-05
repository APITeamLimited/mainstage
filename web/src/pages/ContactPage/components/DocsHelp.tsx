import { ROUTES } from '@apiteam/types/src'
import { Stack, Typography } from '@mui/material'

import { ActionCard } from 'src/layouts/Landing/components/ActionCard'
import { largePanelSpacing } from 'src/layouts/Landing/components/constants'

export const DocsHelp = () => (
  <Stack spacing={largePanelSpacing}>
    <Typography variant="h4">Docs</Typography>
    <ActionCard
      title="Looking for the docs?"
      description="Check out the APITeam docs to learn more about how to use the platform"
      buttonText="Go to docs"
      buttonLink={ROUTES.docs}
    />
  </Stack>
)
