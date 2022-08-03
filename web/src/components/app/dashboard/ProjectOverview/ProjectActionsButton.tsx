import { useRef, useState } from 'react'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  IconButton,
  Tooltip,
  Popover,
  MenuItem,
  ListItemText,
} from '@mui/material'
import { v4 as uuid } from 'uuid'

import { QueryDeleteDialog } from '../../dialogs/QueryDeleteDialog'
import { RenameDialog } from '../../dialogs/RenameDialog'

type ProjectActionsButtonProps = {
  projectYMap: Y.Map<any>
}

export const ProjectActionsButton = ({
  projectYMap,
}: ProjectActionsButtonProps) => {
  const [showActionsPopover, setShowActionsPopover] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)

  const projectName = projectYMap.get('name')
  const projectId = projectYMap.get('id')

  const handleDuplicate = () => {
    const newItem = projectYMap.clone()
    const newId = uuid()
    newItem.set('id', newId)
    newItem.set('name', `${projectName} (copy)`)
    newItem.set('createdAt', new Date().toISOString())
    newItem.set('updatedAt', null)

    // Todo this isnt showing update straight
    projectYMap.parent?.set(newId, newItem)
  }

  const handleRename = (newName: string) => {
    projectYMap.set('name', newName)
    projectYMap.set('updatedAt', new Date().toISOString())
  }

  const handleDelete = () => {
    projectYMap.parent?.delete(projectId)
  }

  if (!projectName) throw new Error('Project name is required')
  if (!projectId) throw new Error('Project id is required')

  return (
    <>
      <RenameDialog
        show={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onRename={handleRename}
        original={projectName}
        title="Rename Project"
      />
      <QueryDeleteDialog
        show={showQueryDeleteDialog}
        onDelete={handleDelete}
        onClose={() => setShowQueryDeleteDialog(false)}
        title="Delete Project"
        description={`Are you sure you want to delete Project ${projectName}?`}
      />
      <Popover
        anchorEl={buttonRef.current}
        open={showActionsPopover}
        onClose={() => setShowActionsPopover(false)}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        sx={{
          mt: 1,
        }}
      >
        <MenuItem
          onClick={() => {
            setShowActionsPopover(false)
            setShowRenameDialog(true)
          }}
        >
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowActionsPopover(false)
            setShowQueryDeleteDialog(true)
          }}
        >
          <ListItemText primary="Delete" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowActionsPopover(false)
            handleDuplicate()
          }}
        >
          <ListItemText primary="Duplicate" />
        </MenuItem>
      </Popover>
      <Tooltip title="Project Actions">
        <IconButton ref={buttonRef} onClick={() => setShowActionsPopover(true)}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
    </>
  )
}
