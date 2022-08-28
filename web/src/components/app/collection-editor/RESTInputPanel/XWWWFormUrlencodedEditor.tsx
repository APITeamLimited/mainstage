import { useState } from 'react'

import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { Stack, Switch, IconButton, Tooltip } from '@mui/material'

import { KeyValueItem, KeyValueEditor } from '../KeyValueEditor'

type XWWWFormUrlencodedEditorProps = {
  bodyValues: KeyValueItem[]
  setBodyValues: (newBodyValues: KeyValueItem[]) => void
  namespace: string
}

export const XWWWFormUrlencodedEditor = ({
  bodyValues,
  setBodyValues,
  namespace,
}: XWWWFormUrlencodedEditorProps) => {
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
          <IconButton onClick={() => setBodyValues([])}>
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
        items={bodyValues}
        setItems={setBodyValues}
        isBulkEditing={isBulkEditing}
        namespace={namespace}
      />
    </Stack>
  )
}
