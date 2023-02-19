import { ROUTES } from '@apiteam/types'
import { Stack, Typography, useTheme } from '@mui/material'

import { ActionCard } from 'src/layouts/Landing/components/ActionCard'
import { largePanelSpacing } from 'src/layouts/Landing/components/constants'

export const DocsHelp = () => {
  const theme = useTheme()

  return (
    <Stack spacing={largePanelSpacing}>
      <Typography variant="h4">Docs</Typography>
      <ActionCard
        title="Looking for the docs?"
        description="Check out the APITeam docs to learn more about how to use the platform"
        buttonText="Go to docs"
        buttonLink={ROUTES.docs}
        backgroundColor={theme.palette.secondary.light}
        invertFontColor
      />
    </Stack>
  )
}
