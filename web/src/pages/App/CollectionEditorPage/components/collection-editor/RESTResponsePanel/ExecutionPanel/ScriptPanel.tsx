import { useEffect, useMemo, useState } from 'react'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, Tooltip, Stack, Typography } from '@mui/material'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { useHashSumModule } from 'src/contexts/imports'

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
  const { default: hash } = useHashSumModule()

  useEffect(() => {
    const customActions = []

    customActions.push(
      <Tooltip title="Copy All" key="Copy All">
        <Box>
          <IconButton
            onClick={() => navigator.clipboard.writeText(source as string)}
          >
            <ContentCopyIcon />
          </IconButton>
        </Box>
      </Tooltip>
    )

    setActionArea(customActions)
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
