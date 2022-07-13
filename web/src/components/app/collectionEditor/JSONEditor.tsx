import { useEffect } from 'react'

import Editor, { DiffEditor, useMonaco } from '@monaco-editor/react'
import { useTheme, Box } from '@mui/material'

type JSONEditorProps = {
  value: string
  onChange: (value?: string) => void
}

export const JSONEditor = ({ value, onChange }: JSONEditorProps) => {
  const theme = useTheme()

  const isDark = theme.palette.mode === 'dark'

  console.log('isDark', isDark)

  const monaco = useMonaco()

  useEffect(() => {
    console.log('monaco', monaco)
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

  return (
    <Box
      sx={{
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {monaco ? (
        <Editor
          height={'calc(100% )'}
          defaultLanguage="json"
          theme={'custom-theme'}
          loading={<></>}
          options={{
            //minimap: { enabled: false },
            // Match the theme
            //fontFamily: theme.typography.fontFamily,
            fontSize: 16,
            fontWeight: theme.typography.fontWeightRegular,
            scrollBeyondLastLine: true,
            'bracketPairColorization.enabled': true,

            //'dropdown.background': theme.palette.background.paper,
            //'dropdown.foreground': theme.palette.text.primary,
            //'dropdown.border': theme.palette.divider,
          }}
          onChange={onChange}
        />
      ) : (
        <></>
      )}
    </Box>
  )
}
