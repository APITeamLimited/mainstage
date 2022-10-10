import { useEffect, useMemo, useState } from 'react'

import DescriptionIcon from '@mui/icons-material/Description'
import { Box, Switch, Tooltip, useTheme } from '@mui/material'
import Markdown from 'markdown-to-jsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'

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
  const theme = useTheme()

  const [showPreview, setShowPreview] = useState(true)

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

  const editor = useMemo(
    () => (
      <MonacoEditor
        value={description}
        onChange={setDescription}
        language="markdown"
        namespace="description-panel"
        placeholder={['# Title', '', '## Subtitle', '', 'Description']}
      />
    ),
    [description, setDescription]
  )

  return showPreview ? (
    <ReflexContainer orientation="vertical" windowResizeAware>
      <ReflexElement>{editor}</ReflexElement>
      <ReflexSplitter
        style={{
          border: 'none',
          backgroundColor: theme.palette.divider,
          marginLeft: '1rem',
          marginRight: '1rem',
        }}
      />
      <ReflexElement>
        <Box
          sx={{
            overflow: 'auto',
            height: '100%',
          }}
        >
          {description.length > 0 ? (
            <Markdown>{description}</Markdown>
          ) : (
            <Box
              sx={{
                height: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              <EmptyPanelMessage
                primaryText="No description"
                secondaryMessages={[
                  'A preview of the description will be shown here',
                ]}
                icon={
                  <DescriptionIcon
                    sx={{
                      marginBottom: 2,
                      width: 80,
                      height: 80,
                      color: theme.palette.action.disabled,
                    }}
                  />
                }
              />
            </Box>
          )}
        </Box>
      </ReflexElement>
    </ReflexContainer>
  ) : (
    editor
  )
}
