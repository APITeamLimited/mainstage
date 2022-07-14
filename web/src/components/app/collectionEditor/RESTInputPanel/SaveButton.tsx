import { useState, useRef } from 'react'

import { useReactiveVar } from '@apollo/client'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SaveIcon from '@mui/icons-material/Save'
import { Button, ButtonGroup, MenuItem, Popover, Stack } from '@mui/material'

import {
  activeWorkspaceVar,
  requestManagerStatusVar,
} from 'src/contexts/reactives'

type SaveButtonProps = {
  needSave?: boolean
}

export const SaveButton = ({ needSave }: SaveButtonProps) => {
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)
  const [showSaveOptionsPopover, setShowSaveOptionsPopover] = useState(false)
  const buttonGroupRef = useRef<HTMLDivElement>(null)

  const isLocalWorkspace = activeWorkspace.id === 'ANONYMOUS_ID'
  const requestManagerStatus = useReactiveVar(requestManagerStatusVar)

  // TODO: implement this
  const isDisabled = false

  return (
    <>
      <ButtonGroup
        ref={buttonGroupRef}
        disabled={isDisabled}
        variant="contained"
        color="success"
        size="small"
      >
        <Button disabled={needSave === false} startIcon={<SaveIcon />}>
          Save
        </Button>
        <Button onClick={() => setShowSaveOptionsPopover(true)}>
          <KeyboardArrowDownIcon />
        </Button>
      </ButtonGroup>
      <Popover
        anchorEl={buttonGroupRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={() => setShowSaveOptionsPopover(false)}
        open={showSaveOptionsPopover}
        sx={{
          mt: 1,
        }}
      >
        <Stack>
          <MenuItem>Save As</MenuItem>
        </Stack>
      </Popover>
    </>
  )
}
