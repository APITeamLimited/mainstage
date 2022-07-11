import { useEffect, useRef, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import {
  Box,
  ButtonBase,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material'
import { useThrottle } from '@react-hook/throttle'
import { DragSourceMonitor, useDrag, useDragDropManager } from 'react-dnd'
import { useDrop } from 'react-dnd'

import {
  LocalFolder,
  LocalRESTRequest,
  localFoldersVar,
  localRESTRequestsVar,
  LocalCollection,
} from 'src/contexts/reactives'

import { NodeActionButton } from '../dialogs/NodeActionButton'

const getNodeIcon = (__typename: string, collapsed: boolean) => {
  if (['LocalFolder', 'RemoteFolder'].includes(__typename) && collapsed) {
    return <FolderIcon />
  } else if (
    ['LocalFolder', 'RemoteFolder'].includes(__typename) &&
    !collapsed
  ) {
    return <FolderOpenIcon />
  } else if (['LocalRESTRequest', 'RemoteRESTRequest'].includes(__typename)) {
    return <InsertDriveFileIcon />
  }
  throw `getNodeIcon: Unknown node type: ${__typename}`
}

export type NodeItem = LocalFolder | LocalRESTRequest | LocalCollection

type NodeProps = {
  item: NodeItem
  parentIndex: number
}

type DropSpace = 'Top' | 'Bottom' | 'Inner' | null

export const Node = ({ item, parentIndex }: NodeProps) => {
  const isRoot = item.__typename === 'LocalCollection'

  const [collapsed, setCollapsed] = useState(isRoot ? false : true)
  const [renaming, setRenaming] = useState(false)
  const localFolders = useReactiveVar(localFoldersVar)
  const localRESTRequests = useReactiveVar(localRESTRequestsVar)
  const dragDropManager = useDragDropManager()
  const monitor = dragDropManager.getMonitor()
  const [dropSpace, setDropSpace] = useThrottle<DropSpace>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()

  const [{ isBeingDragged }, drag] = useDrag(
    () => ({
      type: item.__typename,
      item: {
        item,
        parentIndex,
      },
      collect: (monitor: DragSourceMonitor) => ({
        isBeingDragged: monitor.isDragging(),
        indexBeingDraged: parentIndex,
      }),
    }),
    [item]
  )

  const handleDrop = (dropResult: NodeProps) => {
    console.log('handleDrop', dropResult)

    // Ignore drops on the same node
    if (
      dropResult.item.id === item.id &&
      dropResult.parentIndex === parentIndex &&
      dropResult.item.__typename === item.__typename
    ) {
      return
    }

    // Update
  }

  const [{ hovered, itemBeingDropped, itemBeingHovered, a }, drop] = useDrop(
    () => ({
      accept: ['LocalFolder', 'LocalRESTRequest'],
      drop: (item, monitor) => {
        handleDrop(monitor.getItem())
      },
      collect: (monitor) => ({
        hovered:
          monitor.canDrop() &&
          monitor.isOver({ shallow: true }) &&
          (monitor.getItem() as NodeProps).item.id !== item.id,
        itemBeingHovered: monitor.getItem(),
      }),
    })
  )

  const handleToggle = (event: MouseEvent) => {
    switch (event.detail) {
      case 1:
        setCollapsed(!collapsed)
        break
      case 2:
        setRenaming(true)
        break
    }
  }

  const getNodeItemChildren = ({ node }: { node: NodeItem }): NodeItem[] => {
    const unsortedFolders = localFolders.filter(
      (folder) => folder.parentId === node.id
    )

    const unsortedRESTRequests = localRESTRequests.filter(
      (restRequest) => restRequest.parentId === node.id
    )

    const mergedItems = [...unsortedFolders, ...unsortedRESTRequests]

    // Sort mergedItems by orderingIndex
    const sortedItems = mergedItems.sort((a, b) => {
      if (a.orderingIndex < b.orderingIndex) {
        return -1
      }
      if (a.orderingIndex > b.orderingIndex) {
        return 1
      }
      return 0
    })

    return sortedItems
  }

  // Finding which half cursor is in and setting dropSpace
  useEffect(
    () =>
      monitor.subscribeToOffsetChange(() => {
        const offset = monitor.getClientOffset()
        const element = itemRef?.current?.getBoundingClientRect()

        // Positive index differences occur when being dragged below the original position
        const indexDifference = parentIndex - itemBeingHovered?.parentIndex

        if (element && offset && hovered && Math.abs(indexDifference) >= 1) {
          if (offset.y - element.top > element.height / 2) {
            // If is folder and hovered, perform extra check
            // If more than 10 pixels from bottom set dropSpace to Inner
            if (
              item.__typename === 'LocalFolder' &&
              element.bottom - offset.y > 10
            ) {
              setDropSpace('Inner')
            } else if (indexDifference < -1) {
              setDropSpace('Bottom')
            }
          } else if (indexDifference > 1) {
            setDropSpace('Top')
          }
        } else {
          setDropSpace(null)
        }
      }),
    [
      monitor,
      itemRef,
      dropSpace,
      hovered,
      itemBeingHovered,
      parentIndex,
      item.__typename,
      setDropSpace,
    ]
  )

  const childNodes = ['LocalCollection', 'LocalFolder'].includes(
    item.__typename
  )
    ? getNodeItemChildren({
        node: item,
      })
    : []

  const innerContent = (childNodes &&
    !collapsed &&
    childNodes.map((childNode, childIndex) => (
      <Node key={childIndex} parentIndex={childIndex} item={childNode} />
    ))) as JSX.Element[]

  // Id the root element, just return innerContent
  return isRoot ? (
    <>{innerContent}</>
  ) : (
    <div ref={itemRef}>
      <div ref={drag}>
        <div ref={drop}>
          {dropSpace === 'Top' && hovered && (
            <Box
              sx={{
                height: '0.5rem',
                backgroundColor: theme.palette.primary.light,
                //marginTop: -0.5,
              }}
            />
          )}
          <ListItem
            secondaryAction={<NodeActionButton item={item} />}
            sx={{
              paddingTop: dropSpace === 'Top' ? 0.5 : 1,
              paddingBottom: 0.5,
            }}
            onClick={handleToggle}
          >
            <ListItemIcon
              color={isBeingDragged ? theme.palette.text.secondary : 'inherit'}
            >
              {getNodeIcon(item.__typename, collapsed)}
            </ListItemIcon>
            <ListItemText
              primary={item.name}
              sx={{
                whiteSpace: 'nowrap',
                marginLeft: -2,
                overflow: 'hidden',
                color: isBeingDragged
                  ? theme.palette.text.secondary
                  : 'inherit',
              }}
            />
          </ListItem>
          <Collapse in={!collapsed || hovered} timeout="auto">
            <List
              sx={{
                marginLeft: 4,
                paddingTop: 0,
                paddingBottom: dropSpace === 'Bottom' ? 0.5 : 1,
              }}
            >
              {innerContent.length > 0 ? (
                innerContent
              ) : (
                <Box
                  sx={{
                    paddingY: 1,
                    paddingLeft: 1,
                    backgroundColor:
                      dropSpace === 'Inner' && hovered
                        ? theme.palette.primary.light
                        : theme.palette.alternate.dark,
                  }}
                >
                  <Typography
                    color={theme.palette.text.secondary}
                    fontSize="small"
                    sx={{
                      opacity: dropSpace === 'Inner' && hovered ? 0 : 1,
                    }}
                  >
                    This folder is empty
                  </Typography>
                </Box>
              )}
            </List>
          </Collapse>
          {dropSpace === 'Bottom' && hovered && (
            <Box
              sx={{
                height: '0.5rem',
                marginBottom: -0.5,
                backgroundColor: theme.palette.primary.light,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
