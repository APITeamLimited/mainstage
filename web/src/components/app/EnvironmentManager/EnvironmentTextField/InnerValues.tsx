import { useEffect } from 'react'

import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import {
  $createParagraphNode,
  $getRoot,
  $createTextNode,
  EditorState,
} from 'lexical'

import { EnvironmentTextFieldProps } from './EnvironmentTextFieldComponent'
import KeywordsPlugin from './KeywordsPlugin'
import VariablesPlugin from './VariablePlugin'

export const InnerValues = ({
  placeholder,
  value = '',
  onChange = () => {},
  namespace,
}: EnvironmentTextFieldProps) => {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
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

  const handeChange = (editorState: EditorState) => {
    // Prevent multiple lines in the editor, removing linebreak nodes from the editor state

    // TODO: implement

    console.log('editorState', editorState)

    // TODO: pass back up the tree
  }

  return (
    <>
      <RichTextPlugin
        contentEditable={<ContentEditable />}
        placeholder={placeholder || ''}
      />

      {/*
      To enable history, need to stop being mixed up between components
      <HistoryPlugin />*/}
      <VariablesPlugin />
      <ClearEditorPlugin />
      <OnChangePlugin onChange={handeChange} />
    </>
  )
}
