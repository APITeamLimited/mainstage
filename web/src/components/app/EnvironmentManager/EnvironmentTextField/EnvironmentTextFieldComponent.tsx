import { LexicalComposer } from '@lexical/react/LexicalComposer'

import { InnerValues } from './InnerValues'
import PlaygroundEditorTheme from './Theme'
import { VariableNode } from './VariableNode'

export type EnvironmentTextFieldProps = {
  placeholder?: string
  namespace: string
  value?: string
  onChange?: (value: string, namespace: string) => void
  multiline?: boolean
  contentEditableStyles?: React.CSSProperties
}

const onError = (error: Error) => {
  throw error
}

export const EnvironmentTextField = ({
  placeholder,
  namespace,
  value,
  onChange,
  multiline = false,
}: EnvironmentTextFieldProps) => {
  const initialConfig = {
    namespace,
    onError,
    editorState: null,
    theme: PlaygroundEditorTheme,
    nodes: [VariableNode],
  }

  return (
    <span>
      <LexicalComposer initialConfig={initialConfig}>
        <InnerValues
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          namespace={namespace}
        />
      </LexicalComposer>
    </span>
  )
}
