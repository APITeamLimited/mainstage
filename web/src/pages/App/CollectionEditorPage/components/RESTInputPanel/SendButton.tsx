import { useState, useRef } from 'react'

import type { ExecutionScript } from '@apiteam/types/src'
import CodeIcon from '@mui/icons-material/Code'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
  Button,
  ButtonGroup,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Stack,
} from '@mui/material'

type SendButtonProps = {
  onSend?: (executionScript: ExecutionScript) => void
  executionScripts: ExecutionScript[]
  defaultExecutionScript: ExecutionScript
}

export const SendButton = ({
  onSend,
  executionScripts,
  defaultExecutionScript,
}: SendButtonProps) => {
  const [showScriptsPopover, setShowScriptsPopover] = useState(false)
  const buttonGroupRef = useRef<HTMLDivElement>(null)

  // TODO: implement this
  const isDisabled = false

  const handleSend = (executionScript: ExecutionScript) => {
    setShowScriptsPopover(false)
    onSend?.(executionScript)
  }

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
          onClick={() => handleSend(defaultExecutionScript)}
        >
          Send
        </Button>
        <Button
          onClick={() => setShowScriptsPopover(true)}
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
          horizontal: 'left',
        }}
        onClose={() => setShowScriptsPopover(false)}
        open={showScriptsPopover}
        sx={{
          mt: 1,
        }}
      >
        <Stack>
          {executionScripts.map((executionScript, index) => (
            <MenuItem
              key={index}
              onClick={() => handleSend(executionScript)}
              sx={{
                width: '20rem',
              }}
            >
              <ListItemIcon>
                <CodeIcon />
              </ListItemIcon>
              <ListItemText
                primary={executionScript.prettyName || executionScript.name}
                secondary={executionScript.description}
                secondaryTypographyProps={{ sx: { whiteSpace: 'normal' } }}
                sx={{
                  minHeight: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              />
            </MenuItem>
          ))}
        </Stack>
      </Popover>
    </>
  )
}
