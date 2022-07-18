import { useEffect } from 'react'

import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { createTheme, useTheme } from '@mui/material'
import {
  $createParagraphNode,
  $getRoot,
  $createTextNode,
  EditorState,
} from 'lexical'

import { EnvironmentTextFieldProps } from './EnvironmentTextFieldComponent'
import VariablesPlugin from './VariablePlugin'

export const InnerValues = ({
  placeholder,
  value = '',
  onChange = () => {},
  namespace,
  contentEditableStyles = {},
}: EnvironmentTextFieldProps) => {
  const [editor] = useLexicalComposerContext()
  const theme = useTheme()

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
    //console.log('editorState', editorState)

    console.log(editorState._nodeMap)

    onChange(JSON.stringify(editorState), namespace)
  }

  return (
    <>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            spellCheck={false}
            style={{
              animationDirection: '0.01s',
              animationName: 'mui-auto-fill-cancel',
              appearance: 'auto',
              backgroundAttachment: 'scroll',
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
              paddingBottom: '6px',
              paddingLeft: '14px',
              paddingRight: '14px',
              paddingTop: '6px',
              textAlign: 'start',
              textIndent: '0px',
              textRendering: 'auto',
              textShadow: 'none',
              textTransform: 'none',
              display: 'block',
              fontSize: '16px',
              fontStretch: '100%',
              fontStyle: 'normal',
              lineHeight: '23px',
              letterSpacing: 'normal',
              backgroundColor: theme.palette.alternate.dark,
              borderRadius: theme.shape.borderRadius,
              borderColor: 'transparent',
              outlineColor: theme.palette.primary.main,
              outlineOffset: '-1px',
              overflowWrap: 'normal',
              /*
'border-right-width 0px,
'border-top-color rgb(18, 24, 40),
'border-top-style none,
'border-top-width 0px,
'box-sizing content-box,
'color rgb(18, 24, 40),
'cursor text,

'font-variant-caps normal,
'font-variant-east-asian normal,
'font-variant-ligatures normal,
'font-variant-numeric normal,
'font-weight 400,
'height 22.9861px,
,

'min-width 0px,


'width 411.076px,
'word-spacing 0px,
'writing-mode horizontal-tb,
'-webkit-border-horizontal-spacing 0px,
'-webkit-border-vertical-spacing 0px,
'-webkit-rtl-ordering logical,
'-webkit-tap-highlight-color rgba(0, 0, 0, 0),
'-webkit-border-image none,*/
              ...contentEditableStyles,
            }}
          />
        }
        placeholder={''}
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
