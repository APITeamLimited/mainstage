/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getPossibleVariableMatch } from '@apiteam/types/src'
import { Stack, Tooltip, Typography, useTheme } from '@mui/material'

import { StyledInput } from '../../StyledInput'

import { InnerValues } from './InnerValues'
import {
  getLexicalAddons,
  getLexicalModule,
  LexicalAddons,
  LexicalModule,
} from './module'
import PlaygroundEditorTheme from './Theme'
import {
  $createVariableNode,
  VariableNodeClass,
  VariableNodeType,
} from './VariableNode'

const onError = (error: Error) => {
  throw error
}

const getEditorState = (
  value: string,
  lexical: LexicalModule,
  VariableNodeClass: VariableNodeType
) => {
  const root = lexical.$getRoot()

  if (value === '') {
    root.clear()
    const paragraph = lexical.$createParagraphNode()
    paragraph.append(lexical.$createTextNode(value))
    root.append(paragraph)
  } else {
    root.clear()
    const paragraph = lexical.$createParagraphNode()

    // Find all substrings that start and end with double curly braces
    const matches = getPossibleVariableMatch(value)

    // This is the same code as in the VariablePlugin.tsx file

    const textNode = lexical.$createTextNode(value)

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

      const variableNode = $createVariableNode(
        match.matchingString,
        VariableNodeClass
      )
      node.replace(variableNode)
    })
  }
}

export type EnvironmentTextFieldProps = {
  placeholder?: string
  namespace: string
  value: string
  onChange: (value: string, namespace: string) => void
  contentEditableStyles?: React.CSSProperties
  wrapperStyles?: React.CSSProperties
  label?: string
  description?: string
  error?: boolean
  helperText?: string | false
  innerRightArea?: React.ReactNode
  disabled?: boolean
  tooltipMessage?: string
  noVariables?: boolean
}

export const EnvironmentTextField = ({
  namespace,
  value = '',
  onChange,
  contentEditableStyles = {},
  wrapperStyles = {},
  label = '',
  description = '',
  error = false,
  helperText = '',
  innerRightArea,
  disabled = false,
  tooltipMessage = '',
  noVariables,
}: EnvironmentTextFieldProps) => {
  const [lexical, setLexical] = useState<LexicalModule | null>(null)

  useEffect(() => {
    if (noVariables) return
    getLexicalModule().then(setLexical)
  }, [noVariables])

  const [lexicalAddons, setLexicalAddons] = useState<LexicalAddons | null>(null)

  useEffect(() => {
    if (noVariables) return
    getLexicalAddons().then(setLexicalAddons)
  }, [noVariables])

  const VariableNode = useMemo(() => {
    if (lexical) {
      return VariableNodeClass(lexical)
    }
    return null
  }, [lexical])

  const initialConfig = useMemo(() => {
    if (noVariables || !VariableNode) {
      return null
    }

    if (lexical) {
      return {
        namespace,
        onError,
        editorState: () => getEditorState(value, lexical, VariableNode),
        theme: PlaygroundEditorTheme,
        nodes: [VariableNode],
        editable: !disabled,
      }
    }
    return null
  }, [noVariables, VariableNode, lexical, namespace, disabled, value])

  const theme = useTheme()

  // On copy event, we want to override the clipboard with the raw value
  const onCopy = useCallback(
    (event: {
      clipboardData: { setData: (arg0: string, arg1: string) => void }
      preventDefault: () => void
    }) => {
      event.clipboardData?.setData('text/plain', value)
      event.preventDefault()
    },
    [value]
  )

  const reactiveStyles = useMemo(() => {
    const styles = contentEditableStyles

    if (error) {
      styles.borderColor = theme.palette.error.main
      styles.borderWidth = '1px'
      styles.borderStyle = 'solid'
    }

    styles.color = disabled
      ? theme.palette.text.disabled
      : theme.palette.text.primary

    return styles
  }, [contentEditableStyles, error, theme, disabled])

  const internalValueRef = useRef(value)

  const [spawnKey, setSpawnKey] = useState(0)

  useEffect(() => {
    if (noVariables) return

    if (value !== internalValueRef.current) {
      internalValueRef.current = value
      setSpawnKey((key) => key + 1)
    }
  }, [value, noVariables])

  const innerContent = useMemo(
    () =>
      noVariables ? (
        <StyledInput
          value={value}
          onChangeValue={(newValue) => onChange(newValue, namespace)}
          readonly={disabled}
        />
      ) : (
        <Stack
          direction="row"
          style={{
            overflow: 'hidden',
            maxWidth: '100%',
            height: '100%',
            borderRadius: theme.shape.borderRadius,
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            backgroundColor: disabled
              ? theme.palette.alternate.main
              : theme.palette.alternate.dark,
            borderColor: 'transparent',
            ...wrapperStyles,
          }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          onCopy={onCopy}
          key={spawnKey}
        >
          {lexical && initialConfig && lexicalAddons && VariableNode ? (
            <lexicalAddons.LexicalComposer
              initialConfig={initialConfig}
              key={namespace}
            >
              <InnerValues
                onChange={(newValue) => {
                  if (onChange && newValue !== value) {
                    internalValueRef.current = newValue
                    onChange(newValue, namespace)
                  }
                }}
                namespace={namespace}
                contentEditableStyles={reactiveStyles}
                key={namespace}
                lexical={lexical}
                lexicalAddons={lexicalAddons}
                VariableNodeClass={VariableNode}
              />
            </lexicalAddons.LexicalComposer>
          ) : null}
          {innerRightArea ?? null}
        </Stack>
      ),
    [
      noVariables,
      value,
      disabled,
      theme.shape.borderRadius,
      theme.palette.alternate.main,
      theme.palette.alternate.dark,
      wrapperStyles,
      onCopy,
      spawnKey,
      lexical,
      initialConfig,
      lexicalAddons,
      VariableNode,
      namespace,
      reactiveStyles,
      innerRightArea,
      onChange,
    ]
  )

  return (
    <Stack
      sx={{
        overflow: 'hidden',
        flex: 1,
        maxWidth: '100%',
      }}
    >
      {label !== '' && (
        <Typography
          gutterBottom
          sx={{
            color: theme.palette.text.secondary,
          }}
        >
          <span
            style={{
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        </Typography>
      )}
      {description !== '' && (
        <Typography
          variant="body2"
          color={theme.palette.grey[500]}
          marginBottom={1}
          sx={{
            userSelect: 'none',
          }}
        >
          {description}
        </Typography>
      )}
      {tooltipMessage !== '' ? (
        <Tooltip title={tooltipMessage} placement="top">
          <span>{innerContent}</span>
        </Tooltip>
      ) : (
        innerContent
      )}
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
