import { useReactiveVar } from '@apollo/client'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Box,
} from '@mui/material'
import * as Y from 'yjs'

import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives'

import { EditNameInput } from '../EditNameInput'

import { ListCollapsible } from './ListCollapsible'
import { DropSpaceType } from './Node'
import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

export const FOLDER_LOWER_ADDING_HEIGHT = 12

type FolderNodeProps = {
  isBeingDragged: boolean
  nodeYMap: Y.Map<any>
  renaming: boolean
  renamingRef: React.RefObject<HTMLDivElement>
  setRenaming: (renaming: boolean) => void
  handleRename: (name: string) => void
  handleDelete: () => void
  handleDuplicate: () => void
  dropSpace: DropSpaceType
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  hovered: boolean
  innerContent: JSX.Element[]
  handleToggle: () => void
  handleNewFolder: () => void
  handleNewRESTRequest: () => void
  parentIndex: number
  collectionYMap: Y.Map<any>
}

export const FolderNode = ({
  isBeingDragged,
  nodeYMap,
  renaming,
  renamingRef,
  setRenaming,
  handleRename,
  handleDelete,
  handleDuplicate,
  dropSpace,
  collapsed,
  setCollapsed,
  hovered,
  innerContent,
  handleToggle,
  handleNewFolder,
  handleNewRESTRequest,
  parentIndex,
  collectionYMap,
}: FolderNodeProps) => {
  const theme = useTheme()

  const focusedElementDict = useReactiveVar(focusedElementVar)

  const isInFocus =
    focusedElementDict[getFocusedElementKey(nodeYMap)]?.get('id') ===
    nodeYMap.get('id')

  const handleClick = () => updateFocusedElement(focusedElementDict, nodeYMap)

  return (
    <>
      <ListItem
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
        sx={{
          backgroundColor: isInFocus ? theme.palette.alternate.main : 'inherit',
          height: '40px',
          cursor: 'pointer',
          paddingY: 0,
        }}
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          handleClick()
          handleToggle()
        }}
      >
        {!renaming && (
          <ListItemIcon
            onClick={handleToggle}
            color={isBeingDragged ? theme.palette.text.secondary : 'inherit'}
          >
            {getNodeIcon(nodeYMap, !(!collapsed || hovered))}
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            <EditNameInput
              name={nodeYMap.get('name')}
              setNameCallback={handleRename}
              isRenaming={renaming}
              setIsRenamingCallback={setRenaming}
              renamingRef={renamingRef}
              singleClickCallback={() => setCollapsed(!collapsed)}
            />
          }
          sx={{
            whiteSpace: 'nowrap',
            marginLeft: renaming ? -1 : -2,
            marginRight: renaming ? -1 : 'auto',
            overflow: 'hidden',
            color: isBeingDragged
              ? theme.palette.text.secondary
              : theme.palette.text.primary,
          }}
        />
      </ListItem>
      {nodeYMap.get('__typename') === 'Folder' && (
        <ListCollapsible
          collapsed={collapsed}
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
