import { useEffect, useMemo, useState } from 'react'

import { ResolvedVariable } from '@apiteam/types/src'
import { findVariablesInString } from '@apiteam/types/src'
import { alpha } from '@mui/material'
import { useTheme, Tooltip } from '@mui/material'

import {
  useCollectionVariables,
  useEnvironmentVariables,
} from 'src/contexts/VariablesProvider'

type VariableChipProps = {
  variableName: string
}

export const VariableChip = ({ variableName }: VariableChipProps) => {
  const theme = useTheme()

  const variableNameWithoutCurlyBraces = useMemo(
    () => variableName.replaceAll(/^\{{/g, '').replaceAll(/\}}$/g, ''),
    [variableName]
  )

  const [resolvedVariable, setResolvedVariable] =
    useState<ResolvedVariable | null>(null)

  const environmentContext = useEnvironmentVariables()
  const collectionContext = useCollectionVariables()

  useEffect(() => {
    const foundVariable = findVariablesInString(
      environmentContext,
      collectionContext,
      variableNameWithoutCurlyBraces
    )

    if (foundVariable) {
      if (foundVariable?.value !== resolvedVariable?.value) {
        setResolvedVariable(foundVariable)
      }
    } else if (!foundVariable) {
      setResolvedVariable(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resolvedVariable,
    variableNameWithoutCurlyBraces,
    environmentContext,
    collectionContext,
  ])

  return (
    <Tooltip
      title={
        resolvedVariable
          ? `'${variableNameWithoutCurlyBraces}'='${resolvedVariable.value}' from ${resolvedVariable.sourceTypename} '${resolvedVariable.sourceName}'`
          : `Variable '${variableNameWithoutCurlyBraces}' not found`
      }
      placement="top"
    >
      <span
        style={{
          borderRadius: theme.spacing(1),
          backgroundColor:
            resolvedVariable === undefined
              ? alpha(theme.palette.grey[300], 0.5)
              : resolvedVariable
              ? alpha(theme.palette.primary.main, 0.5)
              : alpha(theme.palette.error.main, 0.5),
          paddingTop: theme.spacing(0.125),
          paddingBottom: theme.spacing(0.125),
        }}
      >
        {variableName}
      </span>
      {/* <Chip
        label={variableNameWithoutCurlyBraces}
        variant="filled"
        color={
          resolvedVariable === undefined
            ? 'default'
            : resolvedVariable
            ? 'primary'
            : 'error'
        }
        sx={{
          borderRadius: 1,

          '& .MuiChip-label': {
            paddingX: '2px',
            fontWeight: 'bold',
          },
          marginX: '1px',
          //marginBottom: 0.125,
          maxHeight: '20px',
          marginBottom: '0.125rem',

          // Make text copyable
          '&:hover': {
            cursor: 'pointer',
          },
          transition: 'none',

          // Enable user select
          userSelect: 'text',
        }}
        size="small"
      /> */}
    </Tooltip>
  )
}
