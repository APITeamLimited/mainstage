import { useState } from 'react'

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { Stack, Switch, IconButton, Tooltip, Box } from '@mui/material'

import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'

type ParametersPanelProps = {
  parameters: KeyValueItem[]
  setParameters: (newParameters: KeyValueItem[]) => void
  requestId: string
}

export const ParametersPanel = ({
  parameters,
  setParameters,
  requestId,
}: ParametersPanelProps) => {
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  return (
    <Stack
      spacing={2}
      sx={{
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{
          overflow: 'hidden',
        }}
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
      <Box
        sx={{
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <KeyValueEditor
          items={parameters}
          setItems={setParameters}
          isBulkEditing={isBulkEditing}
          namespace={requestId}
        />
      </Box>
    </Stack>
  )
}
