import { useState, useRef } from 'react'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Button, ButtonGroup, Popover, Stack } from '@mui/material'

type SendButtonProps = {
  onNormalSend?: () => void
}

export const SendButton = ({
  onNormalSend = () => undefined,
}: SendButtonProps) => {
  const [showSendOptionsPopover, setShowSendOptionsPopover] = useState(false)
  const buttonGroupRef = useRef<HTMLDivElement>(null)

  // TODO: implement this
  const isDisabled = false

  return (
    <>
      <ButtonGroup
        ref={buttonGroupRef}
        disabled={isDisabled}
        variant="contained"
        color="primary"
      >
        <Button
          style={{
            borderRight: 'none',
          }}
          onClick={onNormalSend}
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
