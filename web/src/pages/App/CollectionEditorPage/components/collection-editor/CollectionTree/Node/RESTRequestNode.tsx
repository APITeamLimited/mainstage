import { useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material'
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'zustand-yjs'

import { RequestListItem } from 'src/components/app/utils/RequestListItem'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { focusedResponseVar } from 'src/contexts/focused-response'
import { useYJSModule } from 'src/contexts/imports'
import {
  focusedElementVar,
  getFocusedElementKey,
  updateFocusedElement,
} from 'src/contexts/reactives/FocusedElement'
import { findEnvironmentVariables } from 'src/utils/environment'

import { NodeActionButton } from './NodeActionButton'
import { getNodeIcon } from './utils'

type RESTRequestNodeProps = {
  isBeingDragged: boolean
  nodeYMap: YMap<any>
  collectionYMap: YMap<any>
  renaming: boolean
  setRenaming: (renaming: boolean) => void
  handleRename: (name: string) => void
  handleDelete: () => void
  handleDuplicate: () => void
  collapsed: boolean
}

export const RESTRequestNode = ({
  isBeingDragged,
  nodeYMap,
  collectionYMap,
  renaming,
  setRenaming,
  handleRename,
  handleDelete,
  handleDuplicate,
  collapsed,
}: RESTRequestNodeProps) => {
  const Y = useYJSModule()

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
      collectionYMap.get('restResponses').values() as YMap<any>[]
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
    <RequestListItem
      primaryText={nodeYMap.get('name')}
      setPrimaryText={handleRename}
      renaming={renaming}
      secondaryText={pathname}
      isInFocus={isInFocus}
      onClick={handleClick}
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
      icon={
        !renaming && (
          <ListItemIcon
            color={isBeingDragged ? theme.palette.text.secondary : 'inherit'}
          >
            {getNodeIcon(nodeYMap, collapsed)}
          </ListItemIcon>
        )
      }
      listItemTextSx={{
        color: isBeingDragged
          ? theme.palette.text.secondary
          : theme.palette.text.primary,
      }}
    />
  )
}
