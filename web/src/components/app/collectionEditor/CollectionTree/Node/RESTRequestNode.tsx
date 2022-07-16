import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'

import { LocalRESTRequest } from 'src/contexts/reactives'

import { focusedElementVar } from '../../reactives'
import { EditNameInput } from '../EditNameInput'

import { DropSpace } from './Node'
import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

type RESTRequestNodeProps = {
  isBeingDragged: boolean
  item: LocalRESTRequest
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
}

export const RESTRequestNode = ({
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
}: RESTRequestNodeProps) => {
  const theme = useTheme()

  return (
    <ListItem
      secondaryAction={
        <NodeActionButton
          item={item}
          onDelete={handleDelete}
          onRename={() => setRenaming(true)}
        />
      }
      sx={{
        paddingTop: 1,
        paddingBottom: 0.5,
        backgroundColor: isInFocus ? theme.palette.alternate.main : 'inherit',
      }}
      onClick={
        item.__typename === 'LocalRESTRequest'
          ? () => focusedElementVar(item)
          : undefined
      }
    >
      <ListItemIcon
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
            permitDoubleClickRename={true}
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
  )
}
