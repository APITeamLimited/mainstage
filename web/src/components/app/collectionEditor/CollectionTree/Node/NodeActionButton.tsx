import { useState, useRef } from 'react'

import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  IconButton,
  Popover,
  Stack,
  ListItemText,
  MenuItem,
  ListItemIcon,
} from '@mui/material'

import { NodeItem } from '.'

type NodeActionButtonProps = {
  item: NodeItem
  onDelete: () => void
}

export const NodeActionButton = ({ item, onDelete }: NodeActionButtonProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  return (
    <>
      <IconButton
        edge="end"
        aria-label={`${item.name} actions`}
        ref={buttonRef}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onClick={handleClick}
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
        <Stack>
          <MenuItem onClick={onDelete}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Stack>
      </Popover>
    </>
  )
}
