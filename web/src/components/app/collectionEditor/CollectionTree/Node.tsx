import { memo, useEffect, useRef, useState } from 'react'

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
  TextField,
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

import { focusedElementVar } from '../reactives'

import { EditNameInput } from './EditNameInput'
import { NodeActionButton } from './NodeActionButton'

const getNodeIcon = (item: NodeItem, collapsed: boolean) => {
  if (['LocalFolder', 'RemoteFolder'].includes(item.__typename) && collapsed) {
    return <FolderIcon />
  } else if (
    ['LocalFolder', 'RemoteFolder'].includes(item.__typename) &&
    !collapsed
  ) {
    return <FolderOpenIcon />
  } else if (
    ['LocalRESTRequest', 'RemoteRESTRequest'].includes(item.__typename)
  ) {
    return <Typography fontSize={10}>REST</Typography>
  }
  throw `getNodeIcon: Unknown item type: ${item.__typename}`
}

export type NodeItem = LocalFolder | LocalRESTRequest | LocalCollection

type NodeProps = {
  item: NodeItem
  parentIndex: number
}

type DropSpace = 'Top' | 'Bottom' | 'Inner' | null

export const Node = memo(({ item, parentIndex }: NodeProps) => {
  const isRoot = item.__typename === 'LocalCollection'
  const isSecondRoot = item.__parentTypename === 'LocalCollection'

  const focusedElement = useReactiveVar(focusedElementVar)
  const [collapsed, setCollapsed] = useState(isRoot ? false : true)
  const [renaming, setRenaming] = useState(false)
  const localFolders = useReactiveVar(localFoldersVar)
  const localRESTRequests = useReactiveVar(localRESTRequestsVar)
  const dragDropManager = useDragDropManager()
  const monitor = dragDropManager.getMonitor()
  const [dropSpace, setDropSpace] = useThrottle<DropSpace>(null)
  const itemRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const renamingRef = useRef<HTMLDivElement>(null)

  const [{ hovered, itemBeingDropped, itemBeingHovered, a }, drop] = useDrop(
    () => ({
      accept: ['LocalFolder', 'LocalRESTRequest'],
      drop: (item, monitor) => {
        handleDrop(monitor.getItem(), monitor.getClientOffset())
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

  const [{ isBeingDragged }, drag] = useDrag(() => ({
    type: item.__typename,
    item: {
      item,
      parentIndex,
    },
    collect: (monitor: DragSourceMonitor) => ({
      isBeingDragged: monitor.isDragging(),
      indexBeingDraged: parentIndex,
    }),
  }))

  const handleDrop = (
    dropResult: {
      parentIndex: number
      item: LocalFolder | LocalRESTRequest
    },
    clientOffset: {
      x: number
      y: number
    }
  ) => {
    const element = itemRef?.current?.getBoundingClientRect()

    if (!element) {
      return
    }

    let calculatedDropSpace: DropSpace = null

    if (clientOffset.y - element.top > element.height / 2) {
      if (
        item.__typename === 'LocalFolder' &&
        element.bottom - clientOffset.y > 20
      ) {
        calculatedDropSpace = 'Inner'
      } else {
        calculatedDropSpace = 'Bottom'
      }
    } else {
      calculatedDropSpace = 'Top'
    }

    // Ignore drops on the same node
    if (
      dropResult.item.id === item.id &&
      dropResult.parentIndex === parentIndex &&
      dropResult.item.__typename === item.__typename
    ) {
      return
    }

    let newItem: LocalFolder | LocalRESTRequest

    switch (calculatedDropSpace) {
      case 'Top':
        newItem = {
          ...dropResult.item,
          parentId: item.parentId,
          __parentTypename: item.__parentTypename,
          orderingIndex: item.orderingIndex - 0.5,
        } as LocalFolder | LocalRESTRequest
        break
      case 'Bottom':
        newItem = {
          ...dropResult.item,
          parentId: item.parentId,
          __parentTypename: item.__parentTypename,
          orderingIndex: item.orderingIndex + 0.5,
        } as LocalFolder | LocalRESTRequest
        break
      case 'Inner':
        newItem = {
          ...dropResult.item,
          parentId: item.id,
          __parentTypename: item.__typename,
          orderingIndex: 0,
        } as LocalFolder | LocalRESTRequest
        break
    }

    console.log('calculatedDropSpace', calculatedDropSpace, 'newItem', newItem)

    const itemsThisLevel = getNodeItemChildren({ node: item }) as (
      | LocalFolder
      | LocalRESTRequest
    )[]

    // Insert the new item at the correct orderingIndex, the orderingIndex is a decimal
    // number, so we need to find the correct index to insert the new item at
    const index = itemsThisLevel.findIndex(
      (item) => item.orderingIndex > newItem.orderingIndex
    )

    // Insert the new item at the correct index
    itemsThisLevel.splice(index, 0, newItem)

    // generate whole new orderingIndexes for items this level
    itemsThisLevel.forEach((item, index) => {
      item.orderingIndex = index
    })

    if (newItem.__typename === 'LocalFolder') {
      // LocalFolders on this level
      const localFoldersThisLevel = itemsThisLevel.filter(
        (item) => item.__typename === 'LocalFolder'
      ) as LocalFolder[]

      const newLocalFolders = localFolders

      // Merge with localFolders, updating any ids that match
      localFoldersThisLevel.forEach((localFolder) => {
        const index = newLocalFolders.findIndex(
          (item) => item.id === localFolder.id
        )
        if (index !== -1) {
          newLocalFolders[index] = localFolder
        } else {
          newLocalFolders.push(localFolder)
        }
      })

      localFoldersVar(newLocalFolders)
    } else if (newItem.__typename === 'LocalRESTRequest') {
      // LocalRESTRequests on this level
      const localRESTRequestsThisLevel = itemsThisLevel.filter(
        (item) => item.__typename === 'LocalRESTRequest'
      ) as LocalRESTRequest[]

      const newLocalRESTRequests = localRESTRequests

      // Merge with localRESTRequests, updating any ids that match
      localRESTRequestsThisLevel.forEach((localRESTRequest) => {
        const index = newLocalRESTRequests.findIndex(
          (item) => item.id === localRESTRequest.id
        )
        if (index !== -1) {
          newLocalRESTRequests[index] = localRESTRequest
        } else {
          newLocalRESTRequests.push(localRESTRequest)
        }
      })

      localRESTRequestsVar(newLocalRESTRequests)
      // Set setLastNoneNullDropSpace to null to show processed drop
      //setLastNoneNullDropSpace(null)
    }
  }

  const handleToggle = (event: MouseEvent) => {
    switch (event.detail) {
      case 2:
        setRenaming(true)
        break
      default:
        setCollapsed(!collapsed)
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

    let hadToResort = false

    // generate whole new orderingIndexes for items this level
    sortedItems.forEach((item, index) => {
      if (item.orderingIndex !== index) {
        hadToResort = true
        item.orderingIndex = index
      }
    })

    return sortedItems
  }

  const isInFocus =
    focusedElement?.id === item.id &&
    focusedElement?.__typename === item.__typename

  // Finding which half cursor is in and setting dropSpace
  useEffect(
    () =>
      monitor.subscribeToOffsetChange(() => {
        const offset = monitor.getClientOffset()
        const element = itemRef?.current?.getBoundingClientRect()

        // Positive index differences occur when being dragged below the original position
        const indexDifference = parentIndex - itemBeingHovered?.parentIndex

        if (
          element &&
          offset &&
          hovered // &&
          //Math.abs(indexDifference) >= (isRoot ? 0 : 1)
        ) {
          if (offset.y - element.top > element.height / 2) {
            // If is folder and hovered, perform extra check
            // If more than 10 pixels from bottom set dropSpace to Inner

            if (
              item.__typename === 'LocalFolder' &&
              element.bottom - offset.y > 20
            ) {
              setDropSpace('Inner')
            } else if (indexDifference >= 1) {
              setDropSpace('Bottom')
            }
          } else if (indexDifference <= -1) {
            setDropSpace('Top')
          }
        } else {
          setDropSpace(null)
        }
      }),
    [
      monitor,
      itemRef,
      hovered,
      itemBeingHovered,
      parentIndex,
      item.__typename,
      setDropSpace,
      dropSpace,
    ]
  )

  const handleRename = (newName: string) => {
    if (item.__typename === 'LocalFolder') {
      const newLocalFolders = localFolders.map((folder) => {
        if (folder.id === item.id) {
          return { ...folder, name: newName }
        }
        return folder
      })
      localFoldersVar(newLocalFolders)
    } else if (item.__typename === 'LocalRESTRequest') {
      const newLocalRESTRequests = localRESTRequests.map((restRequest) => {
        if (restRequest.id === item.id) {
          return { ...restRequest, name: newName }
        }
        return restRequest
      })
      localRESTRequestsVar(newLocalRESTRequests)
    }

    setRenaming(false)
  }

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
                marginBottom: -1,
              }}
            />
          )}
          <ListItem
            secondaryAction={<NodeActionButton item={item} />}
            sx={{
              paddingTop: 1,
              paddingBottom: 0.5,
              backgroundColor: isInFocus
                ? theme.palette.background.default
                : 'inherit',
            }}
            onClick={
              item.__typename === 'LocalRESTRequest'
                ? () => focusedElementVar(item)
                : undefined
            }
          >
            <ListItemIcon
              onClick={
                item.__typename === 'LocalFolder' ? handleToggle : undefined
              }
              color={isBeingDragged ? theme.palette.text.secondary : 'inherit'}
            >
              {getNodeIcon(item, collapsed)}
            </ListItemIcon>
            <ListItemText
              primary={
                <EditNameInput
                  name={item.name}
                  setNameCallback={handleRename}
                  isRenaming={renaming}
                  setIsRenamingCallback={setRenaming}
                  renamingRef={renamingRef}
                  singleClickCallback={() => setCollapsed(!collapsed)}
                />
              }
              sx={{
                whiteSpace: 'nowrap',
                marginLeft: -2,
                overflow: 'hidden',
                color: isBeingDragged
                  ? theme.palette.text.secondary
                  : theme.palette.text.primary,
              }}

              //secondary={`parentIndex: ${parentIndex}, orderingIndex: ${item.orderingIndex} ${dropSpace}`}
            />
          </ListItem>
          {item.__typename === 'LocalFolder' && (
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
          )}
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
})
