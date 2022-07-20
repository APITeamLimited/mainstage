import { useEffect } from 'react'

import Editor, { useMonaco } from '@monaco-editor/react'
import { useTheme, Box } from '@mui/material'

export type MonacoSupportedLanguage = 'json' | 'xml' | 'html' | 'plain'

type MonacoEditorProps = {
  value: string
  onChange?: (value: string) => void
  language: MonacoSupportedLanguage
  readOnly?: boolean
  enableMinimap?: boolean
  height?: string
  scrollBeyondLastLine?: boolean
}

export const MonacoEditor = ({
  value,
  onChange = () => undefined,
  language,
  readOnly = false,
  enableMinimap = true,
  scrollBeyondLastLine = true,
}: MonacoEditorProps) => {
  const theme = useTheme()

  const isDark = theme.palette.mode === 'dark'

  const monaco = useMonaco()

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
        'editor.selectionBackground': theme.palette.alternate.main,
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
    <Editor
      height={'100%'}
      language={language}
      theme={'custom-theme'}
      loading={<></>}
      options={{
        minimap: { enabled: enableMinimap },
        readOnly,

        fontFamily: theme.typography.fontFamily,
        fontSize: 16,
        fontWeight: theme.typography.fontWeightRegular,
        scrollBeyondLastLine,
        'bracketPairColorization.enabled': true,
        contextmenu: false,
      }}
      value={value}
      onChange={(value) => onChange(value || '')}
    />
  ) : (
    <></>
  )
}
