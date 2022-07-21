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
  hovered: boolean
  innerContent: JSX.Element[]
  handleToggle: () => void
  handleNewFolder: () => void
  handleNewRESTRequest: () => void
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
  hovered,
  innerContent,
  handleToggle,
  handleNewFolder,
  handleNewRESTRequest,
}: FolderNodeProps) => {
  const theme = useTheme()

  const handleClick = () => {
    if (!isInFocus) {
      focusedElementVar(item)
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
            item={item}
            onDelete={handleDelete}
            onRename={() => setRenaming(true)}
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
          //secondary={`dropSpace ${
          //  dropSpace || 'null'
          //} parentIndex: ${parentIndex}, orderingIndex: ${
          //  item.orderingIndex
          //} dropSpace ${dropSpace} parentType ${item.__parentTypename}`}
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
