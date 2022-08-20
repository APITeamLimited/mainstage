import { Dispatch, SetStateAction } from 'react'

import { TextField } from '@mui/material'

type BulkEditorProps = {
  contents: string
  setContents: Dispatch<SetStateAction<string>>
}

export const BulkEditor = ({ contents, setContents }: BulkEditorProps) => {
  const numberRows = contents.split('\n').length

  return (
    <TextField
      multiline
      fullWidth
      rows={numberRows > 10 ? numberRows : 10}
      value={contents}
      onChange={(event) => setContents(event.target.value)}
    />
  )
}
