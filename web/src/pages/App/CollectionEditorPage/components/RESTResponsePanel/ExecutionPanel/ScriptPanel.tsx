import { useEffect, useState } from 'react'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { IconButton, Tooltip, Stack, Typography } from '@mui/material'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { QuickActionArea } from 'src/components/app/utils/QuickActionArea'

type ScriptPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  source: string
  sourceName: string
}

export const ScriptPanel = ({
  setActionArea,
  source,
  sourceName,
}: ScriptPanelProps) => {
  useEffect(() => {
    const customActions = []

    customActions.push(
      <Tooltip title="Copy All" key="Copy All">
        <IconButton
          onClick={() => navigator.clipboard.writeText(source as string)}
        >
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    )

    setActionArea(<QuickActionArea customActions={customActions} />)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [namespace] = useState(Math.random().toString(36).substring(8))

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Typography
        variant="body1"
        fontWeight="bold"
        sx={{
          userSelect: 'none',
        }}
      >
        Script Name: {sourceName}
      </Typography>
      <MonacoEditor
        language="javascript"
        value={source}
        readOnly={true}
        scrollBeyondLastLine={false}
        namespace={namespace}
      />
    </Stack>
  )
}
