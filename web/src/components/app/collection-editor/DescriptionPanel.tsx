import { useEffect, useState } from 'react'

import { Box, Switch, Tooltip } from '@mui/material'
import Markdown from 'markdown-to-jsx'

import { MonacoEditor } from './MonacoEditor'

type DescriptionPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  description: string
  setDescription: (description: string) => void
}

export const DescriptionPanel = ({
  setActionArea,
  description,
  setDescription,
}: DescriptionPanelProps) => {
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    setActionArea(
      <Tooltip title="Show Preview">
        <Box>
          <Switch
            checked={showPreview}
            onChange={(_, value) => setShowPreview(value)}
          />
        </Box>
      </Tooltip>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreview])

  return showPreview ? (
    <Box overflow="auto" height="100%">
      <Markdown>{description}</Markdown>
    </Box>
  ) : (
    <MonacoEditor
      value={description}
      onChange={setDescription}
      language="markdown"
      namespace="description-panel"
      placeholder={['# Title', '', '## Subtitle', '', 'Description']}
    />
  )
}
