import { useState, useRef } from 'react'

import DeleteIcon from '@mui/icons-material/Delete'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  IconButton,
  Popover,
  Stack,
  ListItemText,
  MenuItem,
  Divider,
} from '@mui/material'

import { NodeItem } from '.'

type NodeActionButtonProps = {
  item: NodeItem
  onDelete: () => void
  onRename: () => void
  onNewFolder?: () => void
  onNewRESTRequest?: () => void
}

export const NodeActionButton = ({
  item,
  onDelete,
  onRename,
  onNewFolder,
  onNewRESTRequest,
}: NodeActionButtonProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleIconClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    event.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  const handleRenameClick = () => {
    setMenuOpen(false)
    onRename()
  }

  const handleNewRESTRequestClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    event.stopPropagation()
    onNewRESTRequest?.()
    setMenuOpen(false)
  }

  const handleNewFolderClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    event.stopPropagation()
    onNewFolder?.()
    setMenuOpen(false)
  }

  return (
    <>
      <IconButton
        edge="end"
        aria-label={`${item.name} actions`}
        ref={buttonRef}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onClick={handleIconClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Popover
        anchorEl={buttonRef.current}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        onClose={() => setMenuOpen(false)}
        open={menuOpen}
        sx={{
          mt: 1,
        }}
      >
        {onNewRESTRequest !== undefined && (
          <MenuItem onClick={handleNewRESTRequestClick}>
            <ListItemText primary="Add REST Request" />
          </MenuItem>
        )}
        {onNewFolder && (
          <MenuItem onClick={handleNewFolderClick}>
            <ListItemText primary="Add Folder" />
          </MenuItem>
        )}
        {onNewRESTRequest && onNewFolder && <Divider />}
        <MenuItem onClick={handleRenameClick}>
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem onClick={onDelete}>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Popover>
    </>
  )
}
