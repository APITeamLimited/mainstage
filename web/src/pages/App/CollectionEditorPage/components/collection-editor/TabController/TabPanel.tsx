/* eslint-disable @typescript-eslint/no-explicit-any */
import { Stack, Typography, useTheme } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { HTML5Backend } from 'src/lib/dnd/backend-html5'
import { DndProvider } from 'src/lib/dnd/react-dnd'

import { Tab } from './Tab'
import type { OpenTab } from './TabController'

export const tabPanelHeight = 42

type TabPanelProps = {
  openTabs: OpenTab[]
  activeTabIndex: number
  setActiveTabIndex: (index: number) => void
}

export const TabPanel = ({
  openTabs,
  activeTabIndex,
  setActiveTabIndex,
}: TabPanelProps) => {
  const theme = useTheme()

  return (
    <Stack
      direction="row"
      sx={{
        // Account for the bottom border
        height: `${tabPanelHeight - 1}px`,
        background: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <DndProvider backend={HTML5Backend}>
        {openTabs.map((openTab, index) => {
          const key = (openTab.topYMap as YMap<any>).get('id')

          return (
            <Typography
              key={key}
              component="div"
              sx={{
                paddingRight: '18px',
              }}
              fontWeight={index === activeTabIndex ? 'bold' : 'normal'}
              onClick={() => setActiveTabIndex(index)}
            >
              {openTab.topYMap.get('name')}
            </Typography>
          )
          /*return (
            <Tab
              key={key}
              openTab={openTab}
              isActive={activeTabIndex === index}
              setActive={() => setActiveTabIndex(index)}
            />
          )*/
        })}
      </DndProvider>
    </Stack>
  )
}
