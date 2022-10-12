import { useEffect, useMemo, useState } from 'react'

import { ResolvedVariable } from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import { Chip, Tooltip } from '@mui/material'

import { useCollection } from 'src/contexts/collection'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useYJSModule } from 'src/contexts/imports'
import { activeEnvironmentVar } from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'
import {
  createEnvironmentContext,
  findVariablesInString,
} from 'src/utils/environment'

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
  const activeEnvironmentHook = useYMap(activeEnvironmentYMap ?? new Y.Map())
  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)
  const collection = useCollection()
  const collectionHook = useYMap(collection ?? new Y.Map())

  const environmentContext = useMemo(
    () =>
      activeEnvironmentYMap
        ? createEnvironmentContext(
            activeEnvironmentYMap,
            activeEnvironmentYMap.doc?.guid as string
          )
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEnvironmentDict, activeEnvironmentHook, collectionHook]
  )

  const collectionContext = useMemo(
    () =>
      collection
        ? createEnvironmentContext(collection, collection.doc?.guid as string)
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collectionHook]
  )

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
