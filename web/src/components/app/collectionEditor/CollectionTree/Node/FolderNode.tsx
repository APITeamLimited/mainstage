import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'

import { LocalFolder } from 'src/contexts/reactives'

import { focusedElementVar } from '../../reactives'
import { EditNameInput } from '../EditNameInput'

import { ListCollapsible } from './ListCollapsible'
import { DropSpace } from './Node'
import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

type FolderNodeProps = {
  isBeingDragged: boolean
  item: LocalFolder
  isInFocus: boolean
  renaming: boolean
  renamingRef: React.RefObject<HTMLDivElement>
  setRenaming: (renaming: boolean) => void
  handleRename: (name: string) => void
  handleDelete: () => void
  dropSpace: DropSpace
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  parentIndex: number
  hovered: boolean
  innerContent: JSX.Element[]
  handleToggle: () => void
}

export const FolderNode = ({
  isBeingDragged,
  item,
  isInFocus,
  renaming,
  renamingRef,
  setRenaming,
  handleRename,
  handleDelete,
  dropSpace,
  collapsed,
  setCollapsed,
  parentIndex,
  hovered,
  innerContent,
  handleToggle,
}: FolderNodeProps) => {
  const theme = useTheme()

  return (
    <>
      <ListItem
        secondaryAction={
          <NodeActionButton item={item} onDelete={handleDelete} />
        }
        sx={{
          paddingTop: 1,
          paddingBottom: 0.5,
          backgroundColor: isInFocus ? theme.palette.alternate.main : 'inherit',
        }}
        onClick={() => focusedElementVar(item)}
      >
        <ListItemIcon
          onClick={item.__typename === 'LocalFolder' ? handleToggle : undefined}
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
            backgroundColor: isBeingDragged ? 'red' : 'inherit',
          }}
          secondary={`dropSpace ${
            dropSpace || 'null'
          } parentIndex: ${parentIndex}, orderingIndex: ${
            item.orderingIndex
          } dropSpace ${dropSpace} parentType ${item.__parentTypename}`}
        />
      </ListItem>
      {item.__typename === 'LocalFolder' && (
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
