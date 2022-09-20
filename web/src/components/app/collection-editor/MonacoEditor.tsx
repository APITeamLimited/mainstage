import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import Editor, { useMonaco, Monaco } from '@monaco-editor/react'
import { useTheme, Box, Typography, Stack } from '@mui/material'

export type MonacoSupportedLanguage = 'json' | 'xml' | 'html' | 'plain'

type MonacoEditorProps = {
  value: string
  onChange?: (value: string) => void
  language: string
  readOnly?: boolean
  enableMinimap?: boolean
  height?: string
  scrollBeyondLastLine?: boolean
  wordWrap?: 'on' | 'off' | 'wordWrapColumn' | 'bounded' | undefined
  namespace: string
  placeholder?: string[]
}

export const MonacoEditor = ({
  value,
  onChange,
  language,
  readOnly = false,
  enableMinimap = true,
  scrollBeyondLastLine = true,
  wordWrap = 'off',
  namespace,
  placeholder,
}: MonacoEditorProps) => {
  const theme = useTheme()

  const isDark = useMemo(
    () => theme.palette.mode === 'dark',
    [theme.palette.mode]
  )

  const monaco = useMonaco()

  // Some namespace characters can't be used as a uri
  const actualNamespace = useMemo(
    () => namespace.replaceAll(':', ''),
    [namespace]
  )

  const editorRef = useRef<HTMLDivElement | null>(null)

  // Need to call synchronously else the cursor position will mess up
  useLayoutEffect(() => {
    const instance = monaco?.editor
      .getModels()
      .find((model) => model.uri.path === `/${actualNamespace}`)

    if (!instance) return

    if (instance.getValue() !== value) instance?.setValue(value)
  }, [monaco, actualNamespace, value])

  useEffect(() => {
    monaco?.editor.defineTheme('custom-theme', {
      base: isDark ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [],
      colors: {
        // For line colors check out:
        // https://microsoft.github.io/monaco-editor/playground.html#customizing-the-appearence-exposed-colors

        'editor.background': theme.palette.background.paper,
        'editor.foreground': theme.palette.text.primary,

        //  Change string color to white

        'editorCursor.foreground': theme.palette.text.primary,
        //'editor.selectionBackground': isDark
        //  ? theme.palette.grey[700]
        //  : theme.palette.grey[300],
        'editor.selectionHighlightBackground': theme.palette.alternate.main,
        'editor.inactiveSelectionBackground': theme.palette.alternate.main,
        'editor.lineHighlightBackground': theme.palette.alternate.main,
        'editor.lineHighlightBorder': theme.palette.alternate.main,

        // Change the color of the gutter background
        'editorLineNumber.foreground': theme.palette.text.secondary,
        'editorLineNumber.activeForeground': theme.palette.text.secondary,

        'editorIndentGuide.background': theme.palette.divider,
        'editorIndentGuide.activeBackground': theme.palette.divider,

        'editorBracketMatch.background': theme.palette.divider,
        'editorBracketMatch.border': theme.palette.divider,
      },
    })
  }, [
    isDark,
    monaco,
    theme.palette.alternate.main,
    theme.palette.background.paper,
    theme.palette.divider,
    theme.palette.text.primary,
    theme.palette.text.secondary,
  ])

  return monaco ? (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {value === '' && placeholder && (
        <Stack
          sx={{
            position: 'relative',
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            top: editorRef.current?.clientTop,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            left: Number(editorRef.current?.clientLeft),
            color: theme.palette.text.secondary,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1,

            overflow: 'visible',
            maxHeight: 0,
          }}
        >
          <Box
            sx={{
              paddingLeft: '71px',
              marginTop: '-1px',
            }}
          >
            {placeholder.map((text, index) => (
              <Box
                key={index}
                sx={{
                  height: '22px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: theme.typography.fontWeightRegular as string,
                  }}
                >
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      )}
      <Editor
        height="100%"
        language={language}
        theme={'custom-theme'}
        loading={<></>}
        options={{
          minimap: { enabled: enableMinimap },
          readOnly,

          fontFamily: theme.typography.fontFamily,
          fontSize: 16,
          fontWeight: theme.typography.fontWeightRegular as string,
          // Make text easier to read
          //letterSpacing: 1,
          scrollBeyondLastLine,
          'bracketPairColorization.enabled': true,
          contextmenu: false,
          wordWrap,

          // Disable new line sequences
        }}
        path={actualNamespace}
        defaultValue={value}
        onChange={(value) => onChange?.(value || '')}
        ref={editorRef}
      />
    </Box>
  ) : (
    <></>
  )
}
