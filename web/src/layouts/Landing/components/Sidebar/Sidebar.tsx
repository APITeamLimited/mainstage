import React from 'react'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'

import { SidebarNav } from './components'

interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  onClose: () => void
  open: boolean
  variant: 'permanent' | 'persistent' | 'temporary' | undefined
}

const Sidebar = ({ open, variant, onClose }: Props): JSX.Element => {
  return (
    <Drawer
      anchor="left"
      onClose={() => onClose()}
      open={open}
      variant={variant}
      sx={{
        '& .MuiPaper-root': {
          width: '100%',
          maxWidth: 280,
        },
      }}
    >
      <Box
        sx={{
          padding: 1,
        }}
      >
        <SidebarNav />
      </Box>
    </Drawer>
  )
}

export default Sidebar
