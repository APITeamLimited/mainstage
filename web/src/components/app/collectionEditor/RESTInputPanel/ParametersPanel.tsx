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

export const ParametersPanel = () => {
  const [parameters, setParameters] = useState<KeyValueItem[]>([])
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  return (
    <Stack alignItems="flex-end" spacing={1}>
      <Stack
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        direction="row"
      >
        <Typography variant="h6">Query Parameters</Typography>
        <Stack alignItems="center" direction="row">
          <Tooltip title="Delete All">
            <IconButton onClick={() => setParameters([])}>
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
          <FormControlLabel
            control={
              <Switch
                checked={isBulkEditing}
                onChange={(event, value) => setIsBulkEditing(value)}
              />
            }
            label="Bulk Edit"
            sx={{
              margin: 0,
            }}
          />
        </Stack>
      </Stack>
      <KeyValueEditor
        items={parameters}
        setItems={setParameters}
        isBulkEditing={isBulkEditing}
      />
    </Stack>
  )
}
