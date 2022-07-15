import { useState } from 'react'

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import {
  Stack,
  Switch,
  FormControlLabel,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material'

import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'

type ParametersPanelProps = {
  parameters: KeyValueItem[]
  setParameters: (newParameters: KeyValueItem[]) => void
}

export const ParametersPanel = ({ parameters, setParameters }: ParametersPanelProps) => {
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  return (
    <Stack spacing={2}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        justifyContent="flex-end"
      >
        <Tooltip title="Delete All">
          <IconButton onClick={() => setParameters([])}>
            <DeleteSweepIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bulk Edit">
          <Switch
            checked={isBulkEditing}
            onChange={(event, value) => setIsBulkEditing(value)}
          />
        </Tooltip>
      </Stack>
      <KeyValueEditor
        items={parameters}
        setItems={setParameters}
        isBulkEditing={isBulkEditing}
      />
    </Stack>
  )
}
