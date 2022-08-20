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

  const handleSaveAsClick = () => {
    setShowSaveOptionsPopover(false)
    onSaveAs()
  }

  return (
    <>
      <ButtonGroup
        ref={buttonGroupRef}
        variant="contained"
        color="secondary"
        size="small"
      >
        <Button
          disabled={needSave === false}
          onClick={onSave}
          style={{ borderRight: 'none' }}
        >
          Save
        </Button>
        <Button
          onClick={() => setShowSaveOptionsPopover(true)}
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
        onClose={() => setShowSaveOptionsPopover(false)}
        open={showSaveOptionsPopover}
        sx={{
          mt: 1,
        }}
      >
        <Stack>
          <MenuItem onClick={handleSaveAsClick}>Save As</MenuItem>
        </Stack>
      </Popover>
    </>
  )
}
