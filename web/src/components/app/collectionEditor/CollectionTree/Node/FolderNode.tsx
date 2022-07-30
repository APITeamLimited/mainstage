import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { focusedElementVar } from '../../reactives'
import { EditNameInput } from '../EditNameInput'

import { ListCollapsible } from './ListCollapsible'
import { DropSpace } from './Node'
import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

type FolderNodeProps = {
  isBeingDragged: boolean
  nodeYMap: Y.Map<any>
  isInFocus: boolean
  renaming: boolean
  renamingRef: React.RefObject<HTMLDivElement>
  setRenaming: (renaming: boolean) => void
  handleRename: (name: string) => void
  handleDelete: () => void
  handleDuplicate: () => void
  dropSpace: DropSpace
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  hovered: boolean
  innerContent: JSX.Element[]
  handleToggle: () => void
  handleNewFolder: () => void
  handleNewRESTRequest: () => void
}

export const FolderNode = ({
  isBeingDragged,
  nodeYMap,
  isInFocus,
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
}: FolderNodeProps) => {
  const theme = useTheme()

  const handleClick = () => {
    if (!isInFocus) {
      focusedElementVar(nodeYMap)
      setCollapsed(false)
    } else {
      handleToggle()
    }
  }

  return (
    <>
      <ListItem
        secondaryAction={
          <NodeActionButton
            nodeYMap={nodeYMap}
            onDelete={handleDelete}
            onRename={() => setRenaming(true)}
            onDuplicate={handleDuplicate}
            onNewFolder={handleNewFolder}
            onNewRESTRequest={handleNewRESTRequest}
          />
        }
        sx={{
          //paddingTop: 1,
          //paddingBottom: 0.5,
          paddingY: 0.75,
          backgroundColor: isInFocus ? theme.palette.alternate.main : 'inherit',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        <ListItemIcon
          onClick={handleClick}
          color={isBeingDragged ? theme.palette.text.secondary : 'inherit'}
        >
          {getNodeIcon(nodeYMap, !(!collapsed || hovered))}
        </ListItemIcon>
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
            marginLeft: -2,
            overflow: 'hidden',
            color: isBeingDragged
              ? theme.palette.text.secondary
              : theme.palette.text.primary,
          }}
          //secondary={`dropSpace ${
          //  dropSpace || 'null'
          //} parentIndex: ${parentIndex}, orderingIndex: ${
          //  nodeYMap.orderingIndex
          //} dropSpace ${dropSpace} parentType ${nodeYMap.__parentTypename}`}
          secondary={`${nodeYMap.get('orderingIndex')}`}
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
    </>
  )
}
