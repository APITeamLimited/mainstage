import { useState } from 'react'

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { Stack, Switch, IconButton, Tooltip } from '@mui/material'

import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'

type HeadersPanelProps = {
  headers: KeyValueItem[]
  setHeaders: (newHeaders: KeyValueItem[]) => void
  requestId: string
}

export const HeadersPanel = ({
  headers,
  setHeaders,
  requestId,
}: HeadersPanelProps) => {
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
      <KeyValueEditor
        items={headers}
        setItems={setHeaders}
        isBulkEditing={isBulkEditing}
        namespace={requestId}
      />
    </Stack>
  )
}
