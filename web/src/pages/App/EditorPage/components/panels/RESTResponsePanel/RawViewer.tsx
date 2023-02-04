import { Box, useTheme } from '@mui/material'

export const RawViewer = ({ rawBody }: { rawBody: string }) => {
  const theme = useTheme()
  // Raw body replace html codes with html entities
  const filteredBody = rawBody.replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>APITEam Response</title>
  <style>
    code {
      font-size: 14px;
      color: ${theme.palette.text.primary};
    }
    body {
      background-color: ${theme.palette.background.paper};
    }
  </style>
</head>
<body>
  <pre>
    <code>${filteredBody}</code>
  </pre>
</body>
  `

  return (
    <iframe
      sandbox="allow-same-origin"
      srcDoc={html}
      title="APITEam Response"
      style={{
        height: '100%',
        width: '100%',
        border: 'none',
      }}
    />
  )
}
