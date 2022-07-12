import { useState, useRef } from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  IconButton,
  Popover,
  Stack,
  ListItemText,
  MenuItem,
  ListItemIcon,
  useTheme,
} from '@mui/material'

import { NodeItem } from './Node'

type NodeActionButtonProps = {
  item: NodeItem
}

export const NodeActionButton = ({ item }: NodeActionButtonProps) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const theme = useTheme()

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
          <MenuItem>
            <ListItemIcon>s</ListItemIcon>
            <ListItemText primary="TODO" />
          </MenuItem>
        </Stack>
      </Popover>
    </>
  )
}
