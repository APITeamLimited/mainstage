import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { RESTRequest } from 'types/src'

import { focusedElementVar } from '../../reactives'
import { EditNameInput } from '../EditNameInput'

import { DropSpace } from './Node'
import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

type RESTRequestNodeProps = {
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
  parentIndex: number
}

export const RESTRequestNode = ({
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
  parentIndex,
}: RESTRequestNodeProps) => {
  const theme = useTheme()

  return (
    <ListItem
      secondaryAction={
        <NodeActionButton
          nodeYMap={nodeYMap}
          onDelete={handleDelete}
          onRename={() => setRenaming(true)}
          onDuplicate={handleDuplicate}
        />
      }
      sx={{
        //paddingTop: 1,
        //paddingBottom: 0.5,
        paddingY: 0.75,
        backgroundColor: isInFocus ? theme.palette.alternate.main : 'inherit',
        cursor: 'pointer',
      }}
      onClick={
        nodeYMap.get('__typename') === 'RESTRequest'
          ? () =>
              focusedElementVar({
                id: nodeYMap.get('id'),
                parentId: nodeYMap.get('parentId'),
                __parentTypename: nodeYMap.get('__parentTypename'),
                __typename: nodeYMap.get('__typename'),
                orderingIndex: nodeYMap.get('orderingIndex'),
                method: nodeYMap.get('method'),
                name: nodeYMap.get('name'),
                endpoint: nodeYMap.get('endpoint'),
                params: nodeYMap.get('params'),
                headers: nodeYMap.get('headers'),
                auth: nodeYMap.get('auth'),
                body: nodeYMap.get('body'),
              } as RESTRequest)
          : undefined
      }
    >
      <ListItemIcon
        color={isBeingDragged ? theme.palette.text.secondary : 'inherit'}
      >
        {getNodeIcon(nodeYMap, collapsed)}
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
        //  nodeYMap.orderingIndex
        //} dropSpace ${dropSpace} parentType ${nodeYMap.__parentTypename}`}
        secondary={`${nodeYMap.get('orderingIndex')}`}
      />
    </ListItem>
  )
}
