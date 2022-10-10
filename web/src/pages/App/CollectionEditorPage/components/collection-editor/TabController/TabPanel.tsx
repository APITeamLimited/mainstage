/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Divider, Stack, useTheme } from '@mui/material'
import SimpleBar from 'simplebar-react'
import type { Map as YMap } from 'yjs'

import { HTML5Backend } from 'src/lib/dnd/backend-html5'
import { DndProvider } from 'src/lib/dnd/react-dnd'

import { Tab } from './Tab'
import type { OpenTab } from './TabController'
import 'simplebar-react/dist/simplebar.min.css'
export const tabPanelHeight = 42

type TabPanelProps = {
  openTabs: OpenTab[]
  activeTabIndex: number
  setActiveTabIndex: (index: number) => void
  deleteTab: (index: number) => void
  handleMove: (dragIndex: number, hoverIndex: number) => void
}

export const TabPanel = ({
  openTabs,
  activeTabIndex,
  setActiveTabIndex,
  deleteTab,
  handleMove,
}: TabPanelProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        // Shift down by 1px to account for the bottom border
        //top: '-1px',
        //bottom: '-1px',

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
            overflowY: 'visible',
            overflowX: 'visible',

            // Shift bottom down by 1px to account for the bottom border
            // /position: 'relative',
          }}
        >
          <DndProvider backend={HTML5Backend}>
            {openTabs.map((openTab, index) => {
              const key = (openTab.topYMap as YMap<any>).get('id')

              /*return (
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
          )*/
              return (
                <Tab
                  key={key}
                  openTab={openTab}
                  isActive={activeTabIndex === index}
                  setActive={() => setActiveTabIndex(index)}
                  deleteTab={() => deleteTab(index)}
                  onMove={handleMove}
                />
              )
            })}
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
    </Box>
  )
}
