import { useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives/FocusedElement'
import { findEnvironmentVariables } from 'src/utils/findVariables'

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
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const environmentHook = useYMap(activeEnvironmentYMap ?? new Y.Map())
  const collectionHook = useYMap(collectionYMap ?? new Y.Map())

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

  const pathname = useMemo(() => {
    try {
      return new URL(
        findEnvironmentVariables(
          activeEnvironmentYMap,
          collectionYMap,
          nodeYMap.get('endpoint')
        )
      ).pathname
    } catch (e) {
      return ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentHook, collectionHook, nodeYMap])

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
        height: '40px',
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
        secondary={
          renaming ? undefined : (
            <Typography
              sx={{
                position: 'relative',
                top: '-3px',
                opacity: 0.6,
                height: '18px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
              fontSize="0.75rem"
              color={theme.palette.text.secondary}
            >
              {pathname}
            </Typography>
          )
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
