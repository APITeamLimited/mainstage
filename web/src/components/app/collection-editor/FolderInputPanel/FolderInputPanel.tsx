import { useEffect, useState } from 'react'

import { Box, Stack, Tab, Tabs } from '@mui/material'

import { LocalFolder } from 'src/contexts/reactives'

import { PanelBreadcrumbs } from '../PanelBreadcrumbs'

type FolderInputPanelProps = {
  folder: LocalFolder
}

export const FolderInputPanel = ({ folder }: FolderInputPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const handleTabChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: number
  ) => {
    setActiveTabIndex(newValue)
  }

  return (
    <>
      <Stack
        padding={2}
        spacing={2}
        sx={{
          height: 'calc(100% - 2em)',
        }}
      >
        <Box
          sx={{
            marginY: 2,
          }}
        >
          <PanelBreadcrumbs item={folder} />
        </Box>
        <Tabs
          value={activeTabIndex}
          onChange={handleTabChange}
          variant="scrollable"
        >
          <Tab label="Authorisation" />
        </Tabs>
      </Stack>
    </>
  )
}
