import React, { useEffect, useMemo, useState } from 'react'

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
  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    const performAsync = async () => {
      const jobInfo = globeTestLogs.find(
        (globeTestLog) => globeTestLog.messageType === 'JOB_INFO'
      )
      if (!jobInfo) throw new Error('No job info found')
      if (typeof jobInfo.message === 'string') {
        throw new Error('Job info is string')
      }
      setSource(await codeFormatter(jobInfo.message.source, 'javascript'))
    }

    performAsync()
  }, [globeTestLogs])

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
