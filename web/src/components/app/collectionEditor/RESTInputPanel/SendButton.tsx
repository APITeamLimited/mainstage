import { useState, useRef } from 'react'

import { useReactiveVar } from '@apollo/client'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Button, ButtonGroup, Popover, Stack } from '@mui/material'

import { activeWorkspaceVar, requestManagerVar } from 'src/contexts/reactives'

type SendButtonProps = {}

export const SendButton = () => {
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)
  const [showSendOptionsPopover, setShowSendOptionsPopover] = useState(false)
  const buttonGroupRef = useRef<HTMLDivElement>(null)

  const isLocalWorkspace = activeWorkspace.id === 'ANONYMOUS_ID'
  const requestManagerStatus = useReactiveVar(requestManagerVar)

  const isDisabled =
    requestManagerStatus.status === 'STARTING' ||
    requestManagerStatus.status === 'SENDING'

  return (
    <>
      <ButtonGroup
        ref={buttonGroupRef}
        disabled={isDisabled}
        variant="contained"
        color="primary"
      >
        <Button>Send</Button>
        <Button onClick={() => setShowSendOptionsPopover(true)} size="small">
          <KeyboardArrowDownIcon />
        </Button>
      </ButtonGroup>
      <Popover
        anchorEl={buttonGroupRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={() => setShowSendOptionsPopover(false)}
        open={showSendOptionsPopover}
        sx={{
          mt: 1,
        }}
      >
        <Stack></Stack>
      </Popover>
    </>
  )
}
