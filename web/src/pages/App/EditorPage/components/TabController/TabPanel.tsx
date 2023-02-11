/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Stack, useTheme } from '@mui/material'

import { useSimplebarReactModule } from 'src/contexts/imports'
import { HTML5Backend } from 'src/lib/dnd/backend-html5'
import { DndProvider } from 'src/lib/dnd/react-dnd'

import { Tab } from './Tab'
import { TabActionButton } from './TabActionButton'
import type { OpenTab } from './TabController'

import 'simplebar-react/dist/simplebar.min.css'

export const tabPanelHeight = 42

type TabPanelProps = {
  openTabs: OpenTab[]
  activeTabIndex: number
  setActiveTabIndex: (index: number) => void
  deleteTab: (index: number) => void
  handleMove: (dragIndex: number, hoverIndex: number) => void
  onCloseAllSaved?: () => void
  onCloseAll?: () => void
}

export const TabPanel = ({
  openTabs,
  activeTabIndex,
  setActiveTabIndex,
  deleteTab,
  handleMove,
  onCloseAllSaved,
  onCloseAll,
}: TabPanelProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  const theme = useTheme()

  return (
    <Stack direction="row" sx={{ height: `${tabPanelHeight}px` }}>
      <Box
        sx={{
          height: `${tabPanelHeight}px`,
          background: theme.palette.background.paper,
          width: '100%',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <SimpleBar
          style={{
            maxWidth: '100%',
            overflowY: 'hidden',
          }}
        >
          <Stack
            direction="row"
            sx={{
              zIndex: 2,
              height: `${tabPanelHeight}px`,
              overflow: 'visible',
            }}
          >
            <DndProvider backend={HTML5Backend}>
              {openTabs.map((openTab, index) => (
                <Tab
                  key={openTab.tabId}
                  openTab={openTab}
                  isActive={activeTabIndex === index}
                  setActive={() => setActiveTabIndex(index)}
                  deleteTab={() => deleteTab(index)}
                  onMove={handleMove}
                />
              ))}
              <Box
                sx={{
                  flexGrow: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  height: `${tabPanelHeight - 1}px`,
                }}
              />
            </DndProvider>
          </Stack>
        </SimpleBar>
        {/* <TabActionButton
        onCloseAll={onCloseAll}
        onCloseAllSaved={onCloseAllSaved}
      /> */}
      </Box>
      <TabActionButton
        onCloseAll={onCloseAll}
        onCloseAllSaved={onCloseAllSaved}
      />
    </Stack>
  )
}
