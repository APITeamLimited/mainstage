import { useEffect } from 'react'

import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { $createParagraphNode, $getRoot, $createTextNode } from 'lexical'

import { EnvironmentTextFieldProps } from './EnvironmentTextFieldComponent'
import KeywordsPlugin from './KeywordsPlugin'

export const InnerValues = ({
  placeholder,
  value = '',
  onChange = () => {},
  namespace,
}: EnvironmentTextFieldProps) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    console.log(value)
    if (value === '') {
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(value))
        root.append(paragraph)
      })
    } else {
      const existingState = JSON.stringify(editor.getEditorState())
      if (existingState !== value) {
        editor.setEditorState(editor.parseEditorState(value))
        // Must focus
        editor.focus()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, namespace, value])

  const handeChange = () => {
    onChange(JSON.stringify(editor.getEditorState()), namespace)
  }

  return (
    <>
      <PlainTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={placeholder || ''}
      />

      {/*
      To enable history, need to stop being mixed up between components
      <HistoryPlugin />*/}
      <ClearEditorPlugin />
      <OnChangePlugin onChange={handeChange} />
      <KeywordsPlugin />
    </>
  )
}
