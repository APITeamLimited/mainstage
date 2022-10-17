import { useEffect, useState } from 'react'

import { DefaultKV, KeyValueItem } from '@apiteam/types/src'
import { Box, Stack, Typography, useTheme } from '@mui/material'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

import { KeyValueEditor } from 'src/components/app/KeyValueEditor'

type ParametersPanelProps = {
  namespace: string
  queryParameters: KeyValueItem<DefaultKV>[]
  pathVariables: KeyValueItem<DefaultKV>[]
  setQueryParameters: (newItems: KeyValueItem<DefaultKV>[]) => void
  setPathVariables: (newItems: KeyValueItem<DefaultKV>[]) => void
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
          <KeyValueEditor<DefaultKV>
            items={queryParameters}
            setItems={setQueryParameters}
            namespace={`${namespace}:query-parameters`}
            setActionArea={setQueryParametersActionArea}
            variant="default"
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
            <KeyValueEditor<DefaultKV>
              items={pathVariables}
              setItems={setPathVariables}
              namespace={`${namespace}:path-variables`}
              setActionArea={setPathActionArea}
              disableAdd
              disableDelete
              disableKeyEdit
              disableCheckboxes
              disableBulkEdit
              variant="default"
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
