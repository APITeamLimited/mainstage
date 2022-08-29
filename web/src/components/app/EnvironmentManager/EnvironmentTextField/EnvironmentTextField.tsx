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
  const [focused, setFocused] = useState(false)

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

  return (
    <Stack
      sx={{
        overflow: 'hidden',
        flex: 1,
        maxWidth: '100%',
      }}
    >
      {label !== '' && <Typography gutterBottom>{label}</Typography>}
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
        onClick={() => setFocused(true)}
      >
        <LexicalComposer initialConfig={initialConfig} key={namespace}>
          <InnerValues
            placeholder={placeholder}
            value={value}
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
          {helperText}
        </Typography>
      )}
    </Stack>
  )
}
