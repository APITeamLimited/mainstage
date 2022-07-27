import { useRef, useState } from 'react'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  IconButton,
  Tooltip,
  Popover,
  MenuItem,
  ListItemText,
} from '@mui/material'

type ProjectActionsButtonProps = {}

export const ProjectActionsButton = ({}: ProjectActionsButtonProps) => {
  const [showPopover, setShowPopover] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Tooltip title="Project Actions">
        <IconButton ref={buttonRef} onClick={() => setShowPopover(true)}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={buttonRef.current}
        open={showPopover}
        onClose={() => setShowPopover(false)}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        sx={{
          mt: 1,
        }}
      >
        <MenuItem>
          <ListItemText primary="Rename" />
        </MenuItem>
        <MenuItem>
          <ListItemText primary="Delete" />
        </MenuItem>
        <MenuItem>
          <ListItemText primary="Duplicate" />
        </MenuItem>
      </Popover>
    </>
  )
}
