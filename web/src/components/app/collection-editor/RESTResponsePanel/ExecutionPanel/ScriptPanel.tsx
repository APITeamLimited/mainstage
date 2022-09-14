import React, { useEffect, useMemo } from 'react'

import { GlobeTestMessage } from '@apiteam/types'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, IconButton, Tooltip } from '@mui/material'

import { codeFormatter } from 'src/utils/codeFormatter'

import { MonacoEditor } from '../../MonacoEditor'

type ScriptPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  globeTestLogs: GlobeTestMessage[]
}

export const ScriptPanel = ({
  setActionArea,
  globeTestLogs,
}: ScriptPanelProps) => {
  const source = useMemo(() => {
    const jobInfo = globeTestLogs.find(
      (globeTestLog) => globeTestLog.messageType === 'JOB_INFO'
    )
    if (!jobInfo) throw new Error('No job info found')
    if (typeof jobInfo.message === 'string') {
      throw new Error('Job info is string')
    }
    return codeFormatter(jobInfo.message.source, 'javascript')
  }, [globeTestLogs])

  useEffect(() => {
    const customActions = []

    customActions.push(
      <Tooltip title="Copy All" key="Copy All">
        <Box>
          <IconButton onClick={() => navigator.clipboard.writeText(source)}>
            <ContentCopyIcon />
          </IconButton>
        </Box>
      </Tooltip>
    )

    setActionArea(customActions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source])

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
