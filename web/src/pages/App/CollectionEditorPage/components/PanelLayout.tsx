import { Grid, Stack, SxProps } from '@mui/material'

import { CustomTabs } from 'src/components/app/CustomTabs'

type PanelLayoutProps = {
  children?: React.ReactNode
  tabNames: string[]
  tabIcons?: {
    name: string
    icon: React.ReactNode
  }[]
  activeTabIndex: number
  setActiveTabIndex: (index: number) => void
  actionArea?: React.ReactNode
  aboveTabsArea?: React.ReactNode
  rootPanelStyles?: SxProps
}

export const PanelLayout = ({
  children,
  tabNames,
  tabIcons,
  activeTabIndex,
  setActiveTabIndex,
  actionArea,
  aboveTabsArea,
  rootPanelStyles,
}: PanelLayoutProps) => (
  <Stack
    padding={2}
    spacing={2}
    sx={{
      height: 'calc(100% - 1.5rem)',
      maxHeight: 'calc(100% - 1.5rem)',
      maxWidth: '100%',
      overflow: 'hidden',
      ...rootPanelStyles,
    }}
  >
    {aboveTabsArea}
    <Grid
      container
      justifyContent="space-between"
      alignItems="center"
      sx={{
        maxWidth: '100%',
        width: '100%',
      }}
    >
      <Grid item sx={{ maxWidth: '100%' }}>
        <CustomTabs
          value={activeTabIndex}
          onChange={setActiveTabIndex}
          names={tabNames}
          icons={tabIcons}
        />
      </Grid>
      <Grid item sx={{ flexGrow: 1, alignItems: 'flex-end' }}>
        {actionArea}
      </Grid>
    </Grid>
    <Stack
      spacing={2}
      sx={{
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {children}
    </Stack>
  </Stack>
)
