import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { focusedElementVar } from 'src/contexts/reactives/FocusedElement'

import { EditNameInput } from '../EditNameInput'

import { ListCollapsible } from './ListCollapsible'
import { DropSpace } from './Node'
import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

type FolderNodeProps = {
  isBeingDragged: boolean
  nodeYMap: Y.Map<any>
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
  parentIndex: number
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
}: FolderNodeProps) => {
  const theme = useTheme()

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
          minHeight: '48px',
          cursor: 'pointer',
          paddingY: 0,
        }}
        onClick={handleToggle}
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
    </>
  )
}
