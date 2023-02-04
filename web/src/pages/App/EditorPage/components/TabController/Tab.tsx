/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useRef } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import {
  useTheme,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  Stack,
} from '@mui/material'

import { useDrag, useDrop } from 'src/lib/dnd/react-dnd'
import type { DragSourceMonitor, XYCoord } from 'src/lib/dnd/react-dnd'
import { useYMap } from 'src/lib/zustand-yjs'

import { getNodeIcon } from '../LeftAside/CollectionTree/Node/utils'

import type { OpenTab } from './TabController'
import { tabPanelHeight } from './TabPanel'

export const tabWidth = 192

type TabProps = {
  openTab: OpenTab
  isActive: boolean
  setActive: () => void
  deleteTab: () => void
  onMove: (dragIndex: number, hoverIndex: number) => void
}

export const Tab = ({
  openTab,
  isActive,
  setActive,
  deleteTab,
  onMove,
}: TabProps) => {
  const theme = useTheme()

  const [{ isBeingDragged }, drag] = useDrag(
    () => ({
      type: 'tab',
      item: openTab,
      collect: (monitor: DragSourceMonitor) => ({
        isBeingDragged: monitor.isDragging(),
      }),
    }),
    [openTab]
  )

  const ref = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop<OpenTab>(
    () => ({
      accept: 'tab',
      hover: (item, monitor) => {
        if (!ref.current) {
          return
        }

        const dragIndex = item.orderingIndex
        const hoverIndex = openTab.orderingIndex

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return
        }

        // Determine rectangle on screen
        const hoverBoundingRect = ref.current?.getBoundingClientRect()

        // Get middle x
        const hoverMiddleX =
          (hoverBoundingRect.right - hoverBoundingRect.left) / 2

        // Determine mouse position
        const clientOffset = monitor.getClientOffset()

        // Get pixels to the left
        const hoverClientX =
          (clientOffset as XYCoord).x - hoverBoundingRect.left

        // Only perform the move when the mouse has crossed half of the items width
        // When dragging right, only move when the cursor is right of 50%
        // When dragging left, only move when the cursor is left of 50%

        // Dragging right
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
          return
        }

        // Dragging left
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
          return
        }

        onMove(dragIndex, hoverIndex)

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        item.orderingIndex = hoverIndex
      },
    }),
    [openTab]
  )

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    event.preventDefault()
    deleteTab()
  }

  const topYMapHook = useYMap(openTab.topYMap)
  const unifiedHook = useYMap(
    openTab?.bottomYMap !== null &&
      openTab.bottomYMap?.get('__typename') !== undefined
      ? openTab?.bottomYMap
      : openTab.topYMap
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tabName = useMemo(
    () =>
      openTab.topYMap?.get('__typename') !== undefined
        ? openTab.topYMap.get('name')
        : 'Deleted',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topYMapHook]
  )
  const nodeYMapIcon = useMemo(
    () =>
      getNodeIcon(
        openTab.bottomYMap?.get('__typename') !== undefined
          ? openTab.bottomYMap
          : openTab.topYMap,
        true
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unifiedHook]
  )

  const [endButtonActive, setEndButtonActive] = useState(false)

  const showNeedSave = useMemo(() => {
    // If endButtonActive is true, then we don't want to show the needSave
    // indicator, because the user is currently editing the tab name.
    if (endButtonActive) {
      return false
    }

    return openTab.needsSave ? true : false
  }, [openTab.needsSave, endButtonActive])

  drag(drop(ref))

  const tabDeleted = useMemo(
    () => openTab.topYMap?.get('__typename') === undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topYMapHook]
  )

  return (
    <Box
      ref={ref}
      sx={{
        cursor: 'pointer',
        // Disable bottom border radius
        zIndex: 13,
        //borderColor: theme.palette.divider,

        //borderLeftWidth: '1px',
        //borderRightWidth: '1px',
        height: `${tabPanelHeight - 1}px`,

        // Enable border
        borderStyle: 'solid',
        borderColor: theme.palette.divider,
        borderWidth: '1px',
        borderLeftWidth: '0px',
        borderRightWidth: '0px',
        borderTopWidth: '0px',
        borderBottomColor: isActive
          ? theme.palette.background.paper
          : theme.palette.divider,
        opacity: isBeingDragged ? 0 : 1,
        marginX: '-0.5px',
      }}
      onMouseEnter={() => setEndButtonActive(true)}
      onMouseLeave={() => setEndButtonActive(false)}
    >
      <Stack direction="row" ref={drop}>
        {openTab.orderingIndex !== 0 && (
          <Divider orientation="vertical" flexItem />
        )}
        <ListItem
          onClick={setActive}
          sx={{
            width: `${tabWidth}px`,
            overflow: 'hidden',
            padding: '0.5rem',
            alignItems: 'center',
            display: 'flex',
          }}
          secondaryAction={
            <Box
              sx={{
                height: '100%',
                width: '22px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showNeedSave && !tabDeleted ? (
                // Circle
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.palette.error.main,
                  }}
                />
              ) : (
                <IconButton size="small" onClick={handleDelete}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          }
        >
          <ListItemIcon
            sx={{
              marginLeft: '0.4rem',
              maxWidth: '1.5rem',
              maxHeight: '1.5rem',
            }}
          >
            {nodeYMapIcon}
          </ListItemIcon>
          <ListItemText
            sx={{
              position: 'relative',
              // Shift left
              left: '-1.5rem',
              marginRight: '0.5rem',
              userSelect: 'none',
            }}
            primary={tabName}
            primaryTypographyProps={{
              noWrap: true,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontWeight: isActive ? 'bold' : 'normal',
            }}
          />
        </ListItem>
        <Divider orientation="vertical" flexItem />
      </Stack>
    </Box>
  )
}
