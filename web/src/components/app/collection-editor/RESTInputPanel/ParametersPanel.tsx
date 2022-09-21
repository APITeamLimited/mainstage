import { useEffect, useState } from 'react'

import { KeyValueItem } from '@apiteam/types'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { KeyValueEditor } from '../KeyValueEditor'

type ParametersPanelProps = {
  namespace: string
  queryParameters: KeyValueItem[]
  pathVariables: KeyValueItem[]
  setQueryParameters: (newItems: KeyValueItem[]) => void
  setPathVariables: (newItems: KeyValueItem[]) => void
  setActionArea?: (actionArea: React.ReactNode) => void
}

export const ParametersPanel = ({
  namespace,
  queryParameters,
  pathVariables,
  setQueryParameters,
  setPathVariables,
  setActionArea,
}: ParametersPanelProps) => {
  const theme = useTheme()

  const [queryParametersActionArea, setQueryParametersActionArea] =
    useState<React.ReactNode>(<></>)
  const [pathActionArea, setPathActionArea] = useState<React.ReactNode>(<></>)

  useEffect(() => {
    setActionArea?.(<></>)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ReflexContainer
      orientation="horizontal"
      windowResizeAware
      style={{
        height: '100%',
      }}
    >
      <ReflexElement
        style={{
          overflow: 'hidden',
        }}
      >
        <Stack
          sx={{
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <Stack
            justifyContent="space-between"
            alignItems="center"
            direction="row"
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                userSelect: 'none',
              }}
            >
              Query Parameters
            </Typography>
            <Box
              sx={{
                height: '100%',
              }}
            >
              {queryParametersActionArea}
            </Box>
          </Stack>
          <KeyValueEditor
            items={queryParameters}
            setItems={setQueryParameters}
            namespace={`${namespace}:query-parameters`}
            setActionArea={setQueryParametersActionArea}
          />
        </Stack>
      </ReflexElement>
      <ReflexSplitter
        style={{
          border: 'none',
          backgroundColor: theme.palette.divider,
          marginTop: '1rem',
          marginBottom: '1rem',
        }}
      />
      <ReflexElement
        style={{
          overflow: 'hidden',
        }}
      >
        <Stack
          sx={{
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <Stack
            justifyContent="space-between"
            alignItems="center"
            direction="row"
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                userSelect: 'none',
              }}
            >
              Path Variables
            </Typography>
            <Box
              sx={{
                height: '100%',
              }}
            >
              {pathActionArea}
            </Box>
          </Stack>
          {pathVariables.length > 0 ? (
            <KeyValueEditor
              items={pathVariables}
              setItems={setPathVariables}
              namespace={`${namespace}:path-variables`}
              setActionArea={setPathActionArea}
              disableAdd
              disableDelete
              disableKeyEdit
              disableCheckboxes
              disableBulkEdit
            />
          ) : (
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                userSelect: 'none',
              }}
              variant="caption"
            >
              Path variables are added here automatically
            </Typography>
          )}
        </Stack>
      </ReflexElement>
    </ReflexContainer>
  )
}
