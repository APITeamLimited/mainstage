import { useReactiveVar } from '@apollo/client'
import { ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import * as Y from 'yjs'

import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives/FocusedElement'

import { focusedResponseVar } from '../../RESTResponsePanel'
import { EditNameInput } from '../EditNameInput'

import { DropSpaceType } from './Node'
import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

type RESTRequestNodeProps = {
  isBeingDragged: boolean
  nodeYMap: Y.Map<any>
  collectionYMap: Y.Map<any>
  renaming: boolean
  renamingRef: React.RefObject<HTMLDivElement>
  setRenaming: (renaming: boolean) => void
  handleRename: (name: string) => void
  handleDelete: () => void
  handleDuplicate: () => void
  dropSpace: DropSpaceType
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  parentIndex: number
}

export const RESTRequestNode = ({
  isBeingDragged,
  nodeYMap,
  collectionYMap,
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
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  const isInFocus =
    focusedElementDict[getFocusedElementKey(nodeYMap)]?.get('id') ===
    nodeYMap.get('id')

  const handleClick = () => {
    // Set focused response to most recent of this node's responses
    const responses = Array.from(
      collectionYMap.get('restResponses').values() as Y.Map<any>[]
    )
      .filter((response) => response.get('parentId') === nodeYMap.get('id'))
      .sort(
        (a, b) =>
          new Date(b.get('createdAt')).getTime() -
          new Date(a.get('createdAt')).getTime()
      )

    if (responses.length > 0) {
      // This works somehow
      focusedResponseDict[getFocusedElementKey(collectionYMap)] = responses[0]
    }

    updateFocusedElement(focusedElementDict, nodeYMap)
  }

  return (
    <ListItem
      secondaryAction={
        !renaming && (
          <NodeActionButton
            nodeYMap={nodeYMap}
            onDelete={handleDelete}
            onRename={() => setRenaming(true)}
            onDuplicate={handleDuplicate}
          />
        )
      }
      sx={{
        backgroundColor: isInFocus ? theme.palette.alternate.main : 'inherit',
        cursor: 'pointer',
        minHeight: '48px',
        paddingY: 0,
      }}
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
        handleClick()
      }}
    >
      {!renaming && (
        <ListItemIcon
          color={isBeingDragged ? theme.palette.text.secondary : 'inherit'}
        >
          {getNodeIcon(nodeYMap, collapsed)}
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
            permitDoubleClickRename={true}
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
  )
}
