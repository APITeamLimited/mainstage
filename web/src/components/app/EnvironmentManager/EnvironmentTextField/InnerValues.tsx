import { useEffect, useState } from 'react'

import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { useTheme } from '@mui/material'
import { $getRoot, EditorState, LexicalNode, ParagraphNode } from 'lexical'

import { EnvironmentTextFieldProps } from './EnvironmentTextField'
import VariablesPlugin from './VariablePlugin'

export const convertToText = (editorState: EditorState): string => {
  return editorState.read(() => {
    const root = $getRoot()
    if (root.getChildrenSize() > 0) {
      const firstRootChildren = root.getChildren()

      // Get children of first child
      return firstRootChildren
        .map((child) => {
          const grandChildren = child.getChildren()
          return grandChildren
            .map((grandChild: LexicalNode) => {
              if (grandChild.__type === 'text') {
                return grandChild.getTextContent()
              } else if (grandChild.__type === 'variable') {
                return grandChild.__variable as string
              } else {
                throw `Unsupported node type: ${grandChild.__type}`
              }
            })
            .join('')
        })
        .join('')
    }
    return ''
  })
}

export const InnerValues = ({
  onChange = () => {},
  namespace,
  contentEditableStyles = {},
}: {
  onChange: EnvironmentTextFieldProps['onChange']
  namespace: EnvironmentTextFieldProps['namespace']
  contentEditableStyles: EnvironmentTextFieldProps['contentEditableStyles']
}) => {
  const [editor] = useLexicalComposerContext()

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
              //outlineColor: theme.palette.primary.main,
              //outlineOffset: '-1px',
              //overflowWrap: 'anywhere',
              outlineStyle: 'none',
              height: '40px',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              paddingLeft: '1px',
              paddingRight: '1px',
              textOverflow: 'hidden',
              maxWidth: '100%',
              ...contentEditableStyles,
            }}
            key={namespace}
          />
        }
        placeholder={''}
      />
      {/*
      To enable history, need to stop being mixed up between components
      */}
      <HistoryPlugin />
      <VariablesPlugin />
      <ClearEditorPlugin />
      <OnChangePlugin onChange={handeChange} />
    </>
  )
}
