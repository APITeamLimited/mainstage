import { useState, useRef } from 'react'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SaveIcon from '@mui/icons-material/Save'
import { Button, ButtonGroup, MenuItem, Popover, Stack } from '@mui/material'


type SaveButtonProps = {
  needSave: boolean
  onSave: () => void
  onSaveAs: () => void
}

export const SaveButton = ({ needSave, onSave, onSaveAs }: SaveButtonProps) => {
  const [showSaveOptionsPopover, setShowSaveOptionsPopover] = useState(false)
  const buttonGroupRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <ButtonGroup
        ref={buttonGroupRef}
        variant="contained"
        color="success"
        size="small"
      >
        <Button disabled={needSave === false} startIcon={<SaveIcon />} onClick={onSave}>
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
          <MenuItem onClick={onSaveAs}>Save As</MenuItem>
        </Stack>
      </Popover>
    </>
  )
}
