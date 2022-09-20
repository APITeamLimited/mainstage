/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { Stack, Typography, useTheme } from '@mui/material'
import {
  $createParagraphNode,
  $getRoot,
  $createTextNode,
  createEditor,
  EditorState,
} from 'lexical'

import { convertToText, InnerValues } from './InnerValues'
import PlaygroundEditorTheme from './Theme'
import { $createVariableNode } from './VariableNode'
import { VariableNode } from './VariableNode'
import { BRACED_REGEX, getPossibleVariableMatch } from './VariablePlugin'

export type EnvironmentTextFieldProps = {
  placeholder?: string
  namespace: string
  value?: string
  onChange?: (value: string, namespace: string) => void
  contentEditableStyles?: React.CSSProperties
  wrapperStyles?: React.CSSProperties
  label?: string
  error?: boolean
  helperText?: string | false
}

const onError = (error: Error) => {
  throw error
}

const getEditorState = (value: string) => {
  const root = $getRoot()

  if (value === '') {
    root.clear()
    const paragraph = $createParagraphNode()
    paragraph.append($createTextNode(value))
    root.append(paragraph)
  } else {
    root.clear()
    const paragraph = $createParagraphNode()

    // Find all substrings that start and end with double curly braces
    const matches = getPossibleVariableMatch(value)

    // This is the same code as in the VariablePlugin.tsx file

    const textNode = $createTextNode(value)

    paragraph.append(textNode)
    root.append(paragraph)

    const offsets = [] as number[]

    matches.forEach((match) => {
      if (!offsets.includes(match.leadOffset)) {
        offsets.push(match.leadOffset)
      }
      if (!offsets.includes(match.leadOffset + match.matchingString.length)) {
        offsets.push(match.leadOffset + match.matchingString.length)
      }
    })

    const splitNodes = textNode.splitText(...offsets)

    matches.forEach((match) => {
      const node = splitNodes.find(
        (node) => node.__text === match.matchingString
      )

      if (!node) return

      const variableNode = $createVariableNode(match.matchingString)
      node.replace(variableNode)
    })
  }
}

export const EnvironmentTextField = ({
  placeholder = '',
  namespace,
  value = '',
  onChange,
  contentEditableStyles = {},
  wrapperStyles = {},
  label = '',
  error = false,
  helperText = '',
}: EnvironmentTextFieldProps) => {
  const theme = useTheme()

  const initialConfig = {
    namespace,
    onError,
    editorState: () => getEditorState(value),
    theme: PlaygroundEditorTheme,
    nodes: [VariableNode],
  }

  const newContentEdibleStyles = contentEditableStyles

  if (error) {
    newContentEdibleStyles.borderColor = theme.palette.error.main
    newContentEdibleStyles.borderWidth = '1px'
    newContentEdibleStyles.borderStyle = 'solid'
  }

  // On copy event, we want to convert the editor state to text
  const onCopy = (event: {
    clipboardData: { setData: (arg0: string, arg1: string) => void }
    preventDefault: () => void
  }) => {
    console.log('onCopy')
    event.clipboardData?.setData('text/plain', value)
    event.preventDefault()
  }

  return (
    <Stack
      sx={{
        overflow: 'hidden',
        flex: 1,
        maxWidth: '100%',
      }}
    >
      {label !== '' && (
        <Typography gutterBottom>
          <span
            style={{
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        </Typography>
      )}
      <div
        style={{
          overflow: 'hidden',
          maxWidth: '100%',
          height: '100%',
          borderRadius: theme.shape.borderRadius,
          paddingLeft: '14px',
          paddingRight: '14px',
          backgroundColor: theme.palette.alternate.dark,
          borderColor: 'transparent',
          ...wrapperStyles,
        }}
        onCopy={onCopy}
      >
        <LexicalComposer initialConfig={initialConfig} key={namespace}>
          <InnerValues
            onChange={onChange}
            namespace={namespace}
            contentEditableStyles={newContentEdibleStyles}
            key={namespace}
          />
        </LexicalComposer>
      </div>
      {error && helperText && (
        <Typography
          sx={{
            color: theme.palette.error.main,
            marginTop: 0.5,
            marginLeft: 1.5,
          }}
          variant="body2"
        >
          <span
            style={{
              userSelect: 'none',
            }}
          >
            {helperText}
          </span>
        </Typography>
      )}
    </Stack>
  )
}
