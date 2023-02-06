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
  Tooltip,
} from '@mui/material'

type SendButtonProps = {
  onSend?: (executionScript: ExecutionScript) => void
  executionScripts: ExecutionScript[]
  defaultExecutionScript: ExecutionScript
  buttonName?: string
}

export const SendButton = ({
  onSend,
  executionScripts,
  defaultExecutionScript,
  buttonName = 'Send',
}: SendButtonProps) => {
  const [showScriptsPopover, setShowScriptsPopover] = useState(false)
  const buttonGroupRef = useRef<HTMLDivElement>(null)

  const handleSend = (executionScript: ExecutionScript) => {
    setShowScriptsPopover(false)
    onSend?.(executionScript)
  }

  return (
    <>
      <ButtonGroup ref={buttonGroupRef} variant="contained" color="primary">
        <TooltipIfDisabled
          disabledReason={defaultExecutionScript.disabledReason}
        >
          <Button
            disabled={defaultExecutionScript.disabledReason !== undefined}
            onClick={() => handleSend(defaultExecutionScript)}
            style={{
              borderRight: 'none',
            }}
          >
            {buttonName}
          </Button>
        </TooltipIfDisabled>
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
            <TooltipIfDisabled
              disabledReason={executionScript.disabledReason}
              key={index}
            >
              <MenuItem
                onClick={() => handleSend(executionScript)}
                disabled={executionScript.disabledReason !== undefined}
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
            </TooltipIfDisabled>
          ))}
        </Stack>
      </Popover>
    </>
  )
}

const TooltipIfDisabled = ({
  disabledReason,
  children,
}: {
  disabledReason?: string
  children: React.ReactNode
}) => {
  if (disabledReason) {
    return (
      <Tooltip title={disabledReason}>
        {/* Some reason linter requires this */}
        <>{children}</>
      </Tooltip>
    )
  }
  return <>{children}</>
}
