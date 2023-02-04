/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Stack,
  Chip,
  ListItemIcon,
  useTheme,
  Tooltip,
  IconButton,
} from '@mui/material'
import type { Map as YMap } from 'yjs'

import { QueryDeleteDialog } from 'src/components/app/dialogs/QueryDeleteDialog'
import { RequestListItem } from 'src/components/app/utils/RequestListItem'
import { EnvironmentIcon } from 'src/components/utils/Icons'
import {
  activeEnvironmentVar,
  focusedElementVar,
  updateActiveEnvironmentId,
  updateFocusedElement,
} from 'src/contexts/reactives'

import { NodeActionButton } from '../CollectionTree/Node/NodeActionButton'

export type EnvironmentItem = {
  name: string
  id: string
  focused: boolean
  active: boolean
  yMap: YMap<any>
}

type EnvironmentTreeItemProps = {
  environment: EnvironmentItem
  branchYMap: YMap<any>
  onDelete: () => void
  onDuplicate: () => void
}

export const EnvironmentTreeItem = ({
  environment,
  branchYMap,
  onDelete,
  onDuplicate,
}: EnvironmentTreeItemProps) => {
  const theme = useTheme()

  const focusedElementDict = useReactiveVar(focusedElementVar)
  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)

  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)
  const [renaming, setRenaming] = useState(false)

  return (
    <>
      <QueryDeleteDialog
        show={showQueryDeleteDialog}
        onClose={() => setShowQueryDeleteDialog(false)}
        onDelete={onDelete}
        title="Delete environment"
        description="Are you sure you want to delete this environment?"
      />
      <RequestListItem
        key={environment.id}
        isInFocus={environment.focused}
        onClick={() =>
          updateFocusedElement(focusedElementDict, environment.yMap)
        }
        primaryText={environment.name}
        primaryTypographyProps={{
          color: environment.active ? theme.palette.primary.main : undefined,
        }}
        secondaryText={environment.active ? 'Active' : undefined}
        renaming={renaming}
        setPrimaryText={(newName) => {
          environment.yMap.set('name', newName)
          setRenaming(false)
        }}
        icon={
          !renaming && (
            <ListItemIcon
              color={theme.palette.text.secondary}
              sx={{
                marginX: -1,
              }}
            >
              <EnvironmentIcon />
            </ListItemIcon>
          )
        }
        secondaryAction={
          !renaming && (
            <Stack spacing={1} direction="row" alignItems="center">
              {!environment.active && (
                <Tooltip title="Activate">
                  <IconButton
                    edge="end"
                    aria-label={`environment ${environment.yMap.get(
                      'name'
                    )} actions`}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onClick={(event) => {
                      event.stopPropagation()
                      updateActiveEnvironmentId(
                        activeEnvironmentDict,
                        branchYMap,
                        environment.id
                      )
                    }}
                    size="medium"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
              <NodeActionButton
                nodeYMap={environment.yMap}
                onDelete={() => setShowQueryDeleteDialog(true)}
                onRename={() => setRenaming(true)}
                onDuplicate={onDuplicate}
              />
            </Stack>
          )
        }
      />
    </>
  )
}
