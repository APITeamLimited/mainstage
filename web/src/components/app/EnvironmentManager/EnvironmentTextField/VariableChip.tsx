import { useEffect, useState } from 'react'

import { Chip, Tooltip } from '@mui/material'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'

type VariableChipProps = {
  variableName: string
}

type ResolvedVariable =
  | {
      sourceName: string
      sourceTypename: 'Environment'
      value: string
    }
  | null
  | undefined

export const VariableChip = ({ variableName }: VariableChipProps) => {
  const [variableNameWithoutCurlyBraces, setVariableNameWithoutCurlyBraces] =
    useState(variableName.replace(/^\{/, '').replace(/\}$/, ''))

  const [resolvedVariable, setResolvedVariable] =
    useState<ResolvedVariable>(undefined)

  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironment = useYMap(activeEnvironmentYMap || new Y.Map())

  useEffect(() => {
    setVariableNameWithoutCurlyBraces(
      variableName.replace(/^\{/, '').replace(/\}$/, '')
    )
  }, [variableName])
  console.log('resolvedVariable', activeEnvironment.data.variables)
  useEffect(() => {
    const variables = activeEnvironment.data.variables || undefined

    if (!variables) {
      setResolvedVariable(null)
      return
    }

    const foundVariable = variables.find(
      (variable) =>
        variable.keyString === variableNameWithoutCurlyBraces &&
        variable.enabled
    )

    if (
      foundVariable?.value !== resolvedVariable?.value &&
      foundVariable?.value
    ) {
      setResolvedVariable({
        sourceName: activeEnvironment.data.name,
        sourceTypename: 'Environment',
        value: foundVariable.value,
      })
    } else {
      setResolvedVariable(null)
    }
    // Prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEnvironment.data, variableNameWithoutCurlyBraces])

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
        label={
          <span>
            <span>&#123;</span>
            <span>{variableNameWithoutCurlyBraces}</span>
            <span>&#125;</span>
          </span>
        }
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
        }}
        size="small"
      />
    </Tooltip>
  )
}
