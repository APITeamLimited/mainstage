import { Dispatch, SetStateAction } from 'react'

import { Box } from '@mui/material'

import { MonacoEditor } from '../MonacoEditor'

type BulkEditorProps = {
  contents: string
  setContents: Dispatch<SetStateAction<string>>
}

export const BulkEditor = ({ contents, setContents }: BulkEditorProps) => (
  <MonacoEditor value={contents} onChange={setContents} language="plain" />
)
