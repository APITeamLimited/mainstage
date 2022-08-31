import { Stack, SxProps } from '@mui/material'

import { CustomTabs } from '../CustomTabs'

type PanelLayoutProps = {
  children?: React.ReactNode
  tabNames: string[]
  activeTabIndex: number
  setActiveTabIndex: (index: number) => void
  actionArea?: React.ReactNode
  aboveTabsArea?: React.ReactNode
  rootPanelStyles?: SxProps
}

export const PanelLayout = ({
  children,
  tabNames,
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
      height: 'calc(100% - 2rem)',
      maxHeight: 'calc(100% - 2rem)',
      maxWidth: '100%',
      ...rootPanelStyles,
    }}
  >
    {aboveTabsArea}
    <Stack
      direction="row"
      spacing={2}
      justifyContent="space-between"
      alignItems="top"
    >
      <CustomTabs
        value={activeTabIndex}
        onChange={setActiveTabIndex}
        names={tabNames}
      />
      {actionArea}
    </Stack>
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
