import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { Stack, Typography, useTheme } from '@mui/material'

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
  wrapperAStyles?: React.CSSProperties
  label?: string
  error?: boolean
  helperText?: string | false
}

const onError = (error: Error) => {
  throw error
}

export const EnvironmentTextField = ({
  placeholder = '',
  namespace,
  value,
  onChange,
  multiline = false,
  contentEditableStyles = {},
  wrapperAStyles = {},
  label = '',
  error = false,
  helperText = '',
}: EnvironmentTextFieldProps) => {
  const theme = useTheme()

  const initialConfig = {
    namespace,
    onError,
    editorState: null,
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
        width: '100%',
      }}
    >
      {label !== '' && (
        <Typography
          sx={{
            marginBottom: 0.5,
          }}
        >
          {label}
        </Typography>
      )}
      <div
        style={{
          display: 'flex',
          width: '100%',
          //width: 'calc(100% - 28px)',
          //marginRight: '28px',
          height: '100%',
          ...wrapperAStyles,
        }}
      >
        <LexicalComposer initialConfig={initialConfig} key={namespace}>
          <InnerValues
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            namespace={namespace}
            contentEditableStyles={newContentEdibleStyles}
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
