import { useState, useRef } from 'react'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { IconButton, Menu, MenuItem, useTheme, Box } from '@mui/material'

import { tabPanelHeight } from './TabPanel'

type TabActionButtonProps = {
  onCloseAllSaved?: () => void
  onCloseAll?: () => void
}

export const TabActionButton = ({
  onCloseAllSaved,
  onCloseAll,
}: TabActionButtonProps) => {
  const theme = useTheme()

  const [open, setOpen] = useState(false)
  const menuAnchor = useRef<HTMLButtonElement>(null)

  return (
    <>
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          height: `${tabPanelHeight - 1}px`,
          width: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconButton ref={menuAnchor} onClick={() => setOpen(true)}>
          <MoreHorizIcon />
        </IconButton>
      </Box>
      <Menu
        anchorEl={menuAnchor.current}
        open={open}
        onClose={() => setOpen(false)}
      >
        <MenuItem
          onClick={() => {
            setOpen(false)
            onCloseAll?.()
          }}
          disabled={!onCloseAll}
        >
          Close all
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpen(false)
            onCloseAllSaved?.()
          }}
          disabled={!onCloseAllSaved}
        >
          Close all saved
        </MenuItem>
      </Menu>
    </>
  )
}
