import { useState, useRef } from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  IconButton,
  Popover,
  ListItemText,
  MenuItem,
  Divider,
} from '@mui/material'

type NodeActionButtonProps = {
  nodeYMap: YMap<any>
  onDelete: () => void
  onRename: () => void
  onDuplicate: () => void
  onNewFolder?: () => void
  onNewRESTRequest?: () => void
}

export const NodeActionButton = ({
  nodeYMap,
  onDelete,
  onRename,
  onDuplicate,
  onNewFolder,
  onNewRESTRequest,
}: NodeActionButtonProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const hasOptionals =
    onNewFolder !== undefined || onNewRESTRequest !== undefined

  const handleIconClick = (
    event: React.MouseEvent<
      HTMLLIElement,
      React.MouseEvent<HTMLLIElement, MouseEvent>
    >
  ) => {
    event.stopPropagation()
    event.preventDefault()
    setMenuOpen(!menuOpen)
  }

  const handleRenameClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    event.stopPropagation()
    setMenuOpen(false)
    onRename()
  }

  const handleDeleteClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    event.stopPropagation()
    setMenuOpen(false)
    onDelete()
  }

  const handleDuplicateClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    event.stopPropagation()
    setMenuOpen(false)
    onDuplicate()
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
        aria-label={`${nodeYMap.get('name')} actions`}
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
        {hasOptionals && <Divider />}
        <MenuItem onClick={handleRenameClick}>
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem onClick={handleDuplicateClick}>
          <ListItemText primary="Duplicate" />
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Popover>
    </>
  )
}
