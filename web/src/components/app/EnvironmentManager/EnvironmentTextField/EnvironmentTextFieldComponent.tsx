import { useEffect } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { $getRoot, $createTextNode } from 'lexical'

import { InnerValues } from './InnerValues'
import { KeywordNode } from './KeywordNode'

export type EnvironmentTextFieldProps = {
  placeholder?: string
  namespace: string
  value?: string
  onChange?: (value: string, namespace: string) => void
}

const onError = (error: Error) => {
  throw error
}

const getInitialState = (value: string) => {
  const root = $getRoot()
  const paragraph = $createTextNode(value)
  root.appendChild(paragraph)
}

export const EnvironmentTextField = ({
  placeholder,
  namespace,
  value,
  onChange,
}: EnvironmentTextFieldProps) => {
  const initialConfig = {
    namespace,
    onError,
    editorState: null,
    nodes: [KeywordNode],
  }
  console.log(namespace)

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        <InnerValues
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          namespace={namespace}
        />
      </LexicalComposer>
      {namespace}
    </>
  )
}
