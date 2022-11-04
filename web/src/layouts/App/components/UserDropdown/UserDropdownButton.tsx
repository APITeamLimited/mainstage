import { useState, useRef } from 'react'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { Avatar, Box, SvgIcon, ButtonBase } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'

import { DropdownPopover } from './DropdownPopover'

export const UserDropdownButton = () => {
  const anchorRef = useRef<HTMLButtonElement | null>(null)
  const [openPopover, setOpenPopover] = useState<boolean>(false)

  const handleOpenPopover = () => {
    setOpenPopover(true)
  }

  const handleClosePopover = () => {
    setOpenPopover(false)
  }

  const { currentUser } = useAuth()

  return currentUser ? (
    <>
      <Box
        component={ButtonBase}
        onClick={handleOpenPopover}
        ref={anchorRef}
        sx={{
          alignItems: 'center',
          display: 'flex',
          borderRadius: 4,
          height: 30,
          width: 30,
          maxWidth: 30,
          minHeight: 30,
          overflow: 'hidden',
        }}
      >
        <Avatar
          sx={{
            height: 30,
            width: 30,
          }}
          src={currentUser?.profilePicture || ''}
        >
          <SvgIcon
            component={AccountCircleIcon}
            sx={{
              height: 30,
              width: 30,
            }}
          />
        </Avatar>
      </Box>
      <DropdownPopover
        anchorEl={anchorRef.current}
        onClose={handleClosePopover}
        open={openPopover}
        currentUser={currentUser}
      />
    </>
  ) : (
    <></>
  )
}
