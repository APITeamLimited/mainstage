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

export const HeadersPanel = () => {
  const [headers, setHeaders] = useState<KeyValueItem[]>([])
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  return (
    <Stack spacing={2}>
      <Stack
        justifyContent="flex-end"
        alignItems="center"
        width="100%"
        direction="row"
      >
        <Stack alignItems="center" direction="row">
        <Tooltip title="Delete All">
            <IconButton onClick={() => setHeaders([])}>
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
      </Stack>
      <KeyValueEditor
        items={headers}
        setItems={setHeaders}
        isBulkEditing={isBulkEditing}
      />
    </Stack>
  )
}
