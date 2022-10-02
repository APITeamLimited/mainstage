import { Dispatch, SetStateAction } from 'react'

import { MonacoEditor } from '../MonacoEditor'

type BulkEditorProps = {
  contents: string
  setContents: Dispatch<SetStateAction<string>>
  monacoNamespace: string
}

export const BulkEditor = ({
  contents,
  setContents,
  monacoNamespace,
}: BulkEditorProps) => (
  <MonacoEditor
    value={contents}
    onChange={setContents}
    language="plain"
    namespace={monacoNamespace}
    key={monacoNamespace}
    placeholder={[
      'Enter key value pairs here, e.g:',
      '',
      'Key:Value',
      '#DisabledKey:Value',
    ]}
  />
)
