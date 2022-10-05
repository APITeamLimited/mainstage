import React, { useEffect, useMemo, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, Tooltip } from '@mui/material'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { codeFormatter } from 'src/utils/codeFormatter'

type ScriptPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  source: string
}

export const ScriptPanel = ({ setActionArea, source }: ScriptPanelProps) => {
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

  if (source === null) return <></>

  return (
    <MonacoEditor
      language="javascript"
      value={source}
      readOnly={true}
      scrollBeyondLastLine={false}
      namespace="executionScript"
    />
  )
}
