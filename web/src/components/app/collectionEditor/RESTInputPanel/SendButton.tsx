import { useState, useRef } from 'react'

import { useReactiveVar } from '@apollo/client'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Button, ButtonGroup, Popover, Stack } from '@mui/material'

import { activeWorkspaceVar, restRequestQueueVar } from 'src/contexts/reactives'

type SendButtonProps = {}

export const SendButton = () => {
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)
  const [showSendOptionsPopover, setShowSendOptionsPopover] = useState(false)
  const buttonGroupRef = useRef<HTMLDivElement>(null)

  const isLocalWorkspace = activeWorkspace.id === 'ANONYMOUS_ID'
  const requestManagerStatus = useReactiveVar(restRequestQueueVar)

  // TODO: implement this
  const isDisabled = false

  return (
    <>
      <ButtonGroup
        ref={buttonGroupRef}
        disabled={isDisabled}
        variant="contained"
        color="primary"
        size="small"
      >
        <Button
          style={{
            borderRight: 'none',
          }}
        >
          Send
        </Button>
        <Button
          onClick={() => setShowSendOptionsPopover(true)}
          sx={{
            paddingX: '0px',
          }}
        >
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
