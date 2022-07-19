import { useEffect, useState } from 'react'

import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { createTheme, useTheme } from '@mui/material'
import {
  $createParagraphNode,
  $getRoot,
  $createTextNode,
  EditorState,
  NodeMap,
  LexicalNode,
  LineBreakNode,
  ParagraphNode,
} from 'lexical'

import { EnvironmentTextFieldProps } from './EnvironmentTextFieldComponent'
import { $createVariableNode } from './VariableNode'
import VariablesPlugin from './VariablePlugin'

const convertToText = (editorState: EditorState): string => {
  return editorState.read(() => {
    const root = $getRoot()
    if (root.getChildrenSize() > 0) {
      const firstRootChildren = root.getChildren()

      // Get children of first child
      const grandChildren = firstRootChildren[0].getChildren()

      return grandChildren
        .map((grandChild: LexicalNode) => {
          if (grandChild.__type === 'text') {
            return grandChild.__text as string
          } else if (grandChild.__type === 'variable') {
            return grandChild.__variable as string
          } else {
            throw `Unsupported node type: ${grandChild.__type}`
          }
        })
        .join('')
    }
    return ''
  })
}

export const InnerValues = ({
  placeholder,
  value = '',
  onChange = () => {},
  namespace,
  contentEditableStyles = {},
}: EnvironmentTextFieldProps) => {
  const [editor] = useLexicalComposerContext()
  const theme = useTheme()
  const [oldValue, setOldValue] = useState('')

  useEffect(() => {
    // Delete any line break ndoes
    editor.registerNodeTransform(ParagraphNode, (paragraphNode) => {
      paragraphNode.getChildren().forEach((childNode) => {
        if (childNode.getType() === 'linebreak') {
          childNode.remove()
        }
      })
    })
  }, [editor])

  useEffect(() => {
    editor.update(() => {
      console.log('Updating editor', value)

      if (value === '') {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(value))
        root.append(paragraph)
      } else {
        const existingState = convertToText(editor.getEditorState())

        if (existingState !== oldValue) {
          return
        }

        //if (value === oldValue) {
        //  console.log('old', oldValue, existingState)
        //  return
        //}

        if (existingState !== value) {
          const root = $getRoot()
          root.clear()
          const paragraph = $createParagraphNode()

          // Find substrings that start and end with curly braces
          const regex = /{(.*?)}/
          const matches = value.match(regex) || []

          // Split value into an array of strings, divided by matches
          const values = value.split(regex)?.filter((match) => match !== '')

          let matchesIndex = 0

          values.forEach((subValue) => {
            // Check if value is the value at matchIndex
            if (matchesIndex >= matches.length) {
              paragraph.append($createTextNode(subValue))
            } else if (`{${subValue}}` === matches[matchesIndex]) {
              paragraph.append($createVariableNode(`{${subValue}}`))
              matchesIndex++
            } else {
              paragraph.append($createTextNode(subValue))
            }
          })

          root.append(paragraph)
          setOldValue(value)
        }
      }

      // Must focus
      editor.focus()
    })
  }, [editor, namespace, value])

  const handeChange = (editorState: EditorState) => {
    onChange(convertToText(editorState), namespace)
  }

  return (
    <>
      <PlainTextPlugin
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

              paddingLeft: '14px',
              paddingRight: '14px',
              textAlign: 'start',
              textIndent: '0px',
              textRendering: 'auto',
              textShadow: 'none',
              textTransform: 'none',
              display: 'flex',
              fontSize: '16px',
              fontStretch: '100%',
              fontStyle: 'normal',
              lineHeight: '23px',
              letterSpacing: 'normal',
              alignItems: 'center',
              justifyContent: 'flex-start',
              backgroundColor: theme.palette.alternate.dark,
              borderRadius: theme.shape.borderRadius,
              borderColor: 'transparent',
              outlineColor: theme.palette.primary.main,
              outlineOffset: '-2px',
              overflowWrap: 'normal',
              width: '100%',
              height: '40px',
              overflowX: 'hidden',
              whiteSpace: 'nowrap',
              overflowY: 'hidden',
              ...contentEditableStyles,
            }}
            key={namespace}
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
