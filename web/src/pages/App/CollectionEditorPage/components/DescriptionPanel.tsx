import { useEffect, useMemo, useState } from 'react'

import DescriptionIcon from '@mui/icons-material/Description'
import { Box, Switch, Tooltip, useTheme } from '@mui/material'
import Markdown from 'markdown-to-jsx'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { QuickActionArea } from 'src/components/app/utils/QuickActionArea'
import { useSimplebarReactModule } from 'src/contexts/imports'

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
  const { default: SimpleBar } = useSimplebarReactModule()

  const theme = useTheme()

  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    const customActions = [
      <Tooltip title="Show Preview" key={1}>
        <Switch
          checked={showPreview}
          onChange={(_, value) => setShowPreview(value)}
        />
      </Tooltip>,
    ]

    setActionArea(<QuickActionArea customActions={customActions} />)
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
          marginLeft: '0.5rem',
          marginRight: '0.5rem',
        }}
      />
      <ReflexElement
        style={{
          overflow: 'hidden',
          maxHeight: '100%',
          minHeight: '100%',
        }}
      >
        {description.length > 0 ? (
          <SimpleBar
            style={{ height: '100%', maxWidth: '100%', maxHeight: '100%' }}
          >
            <Markdown>{description}</Markdown>
          </SimpleBar>
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
      </ReflexElement>
    </ReflexContainer>
  ) : (
    editor
  )
}
