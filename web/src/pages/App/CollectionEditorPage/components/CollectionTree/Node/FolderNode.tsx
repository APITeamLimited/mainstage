/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import { ListItemIcon, useTheme, Box } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { RequestListItem } from 'src/components/app/utils/RequestListItem'
import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives'
import type { ConnectDragSource } from 'src/lib/dnd'

import { ListCollapsible } from './ListCollapsible'
import { DropSpaceType } from './Node'
import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

export const FOLDER_LOWER_ADDING_HEIGHT = 12

type FolderNodeProps = {
  isBeingDragged: boolean
  nodeYMap: YMap<any>
  renaming: boolean
  setRenaming: (renaming: boolean) => void
  handleRename: (name: string) => void
  handleDelete: () => void
  handleDuplicate: () => void
  dropSpace: DropSpaceType
  collapsed: boolean
  hovered: boolean
  innerContent: JSX.Element[]
  handleToggle: () => void
  handleNewFolder: () => void
  handleNewRESTRequest: () => void
  dragRef: ConnectDragSource
}

export const FolderNode = ({
  isBeingDragged,
  nodeYMap,
  renaming,
  setRenaming,
  handleRename,
  handleDelete,
  handleDuplicate,
  dropSpace,
  collapsed,
  hovered,
  innerContent,
  handleToggle,
  handleNewFolder,
  handleNewRESTRequest,
  dragRef,
}: FolderNodeProps) => {
  const theme = useTheme()

  const focusedElementDict = useReactiveVar(focusedElementVar)

  const isInFocus =
    focusedElementDict[getFocusedElementKey(nodeYMap)]?.get('id') ===
    nodeYMap.get('id')

  const handleClick = () => updateFocusedElement(focusedElementDict, nodeYMap)

  const showCollapsedIcon = useMemo(() => {
    if (isBeingDragged) return true
    else return !(!collapsed || hovered)
  }, [collapsed, hovered, isBeingDragged])

  return (
    <>
      <div ref={dragRef}>
        <RequestListItem
          primaryText={nodeYMap.get('name')}
          setPrimaryText={handleRename}
          renaming={renaming}
          isInFocus={isInFocus}
          onClick={() => {
            handleClick()
            handleToggle()
          }}
          secondaryAction={
            !renaming && (
              <NodeActionButton
                nodeYMap={nodeYMap}
                onDelete={handleDelete}
                onRename={() => setRenaming(true)}
                onDuplicate={handleDuplicate}
                onNewFolder={handleNewFolder}
                onNewRESTRequest={handleNewRESTRequest}
              />
            )
          }
          icon={
            !renaming && (
              <ListItemIcon
                onClick={handleToggle}
                color={
                  isBeingDragged ? theme.palette.text.secondary : 'inherit'
                }
              >
                {getNodeIcon(nodeYMap, showCollapsedIcon)}
              </ListItemIcon>
            )
          }
          listItemTextSx={{
            color: isBeingDragged
              ? theme.palette.text.secondary
              : theme.palette.text.primary,
          }}
        />
      </div>
      {nodeYMap.get('__typename') === 'Folder' && (
        <ListCollapsible
          collapsed={isBeingDragged || collapsed}
          hovered={hovered}
          dropSpace={dropSpace}
          innerContent={innerContent}
        />
      )}
      {nodeYMap.get('__typename') === 'Folder' && (!collapsed || hovered) && (
        <Box
          sx={{
            height: `${FOLDER_LOWER_ADDING_HEIGHT}px`,
          }}
        />
      )}
    </>
  )
}
