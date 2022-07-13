import { useState } from 'react'

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import {
  Stack,
  Switch,
  FormControlLabel,
  Typography,
  IconButton,
} from '@mui/material'

import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'

export const HeadersPanel = () => {
  const [headers, setHeaders] = useState<KeyValueItem[]>([])
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  return (
    <Stack alignItems="flex-end" spacing={1}>
      <Stack
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        direction="row"
      >
        <Typography variant="h6">Headers</Typography>
        <Stack alignItems="center" direction="row">
          <IconButton
            aria-label="Delete all headers"
            onClick={() => setHeaders([])}
          >
            <DeleteSweepIcon />
          </IconButton>
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
        items={headers}
        setItems={setHeaders}
        isBulkEditing={isBulkEditing}
      />
    </Stack>
  )
}
