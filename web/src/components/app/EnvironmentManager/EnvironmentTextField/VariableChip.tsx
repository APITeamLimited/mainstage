import { useEffect, useMemo, useState } from 'react'

import { ResolvedVariable } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import { Chip, Tooltip } from '@mui/material'
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'src/lib/zustand-yjs'

import { useCollection } from 'src/contexts/collection'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useYJSModule } from 'src/contexts/imports'
import { activeEnvironmentVar } from 'src/contexts/reactives'
import { findVariablesInString } from 'src/utils/environment'

type VariableChipProps = {
  variableName: string
}

export const VariableChip = ({ variableName }: VariableChipProps) => {
  const Y = useYJSModule()

  const variableNameWithoutCurlyBraces = useMemo(
    () => variableName.replaceAll(/^\{{/g, '').replaceAll(/\}}$/g, ''),
    [variableName]
  )

  const [resolvedVariable, setResolvedVariable] =
    useState<ResolvedVariable | null>(null)

  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  useYMap(activeEnvironmentYMap || new Y.Map())
  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)
  const collection = useCollection()

  useEffect(() => {
    const foundVariable = findVariablesInString(
      activeEnvironmentYMap,
      collection,
      variableNameWithoutCurlyBraces
    )

    if (foundVariable) {
      if (foundVariable?.value !== resolvedVariable?.value) {
        setResolvedVariable(foundVariable)
      }
    } else if (!foundVariable) {
      setResolvedVariable(null)
    }
  }, [
    resolvedVariable,
    variableNameWithoutCurlyBraces,
    activeEnvironmentDict,
    activeEnvironmentYMap,
    collection,
  ])

  return (
    <Tooltip
      title={
        resolvedVariable
          ? `'${variableNameWithoutCurlyBraces}'='${resolvedVariable.value}'`
          : `Variable '${variableNameWithoutCurlyBraces}' not found`
      }
      placement="top"
    >
      <Chip
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
      />
    </Tooltip>
  )
}
