import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import { TextField } from '@mui/material'

import { KeyValueItem } from './KeyValueEditor'

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
      rows={numberRows > 10 ? 10 : numberRows + 2}
      value={contents}
      onChange={(event) => setContents(event.target.value)}
    />
  )
}
