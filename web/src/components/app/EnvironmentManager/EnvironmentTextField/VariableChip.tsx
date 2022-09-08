import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Chip, Tooltip } from '@mui/material'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { activeEnvironmentVar } from 'src/contexts/reactives'

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
    useState<ResolvedVariable | null>(null)

  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironment = useYMap(activeEnvironmentYMap || new Y.Map())
  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)

  useEffect(() => {
    setVariableNameWithoutCurlyBraces(
      variableName.replace(/^\{/, '').replace(/\}$/, '')
    )
  }, [variableName])

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

    if (foundVariable?.value !== resolvedVariable?.value) {
      if (!foundVariable?.value) {
        setResolvedVariable(null)
        return
      }

      setResolvedVariable({
        sourceName: activeEnvironment.data.name,
        sourceTypename: 'Environment',
        value: foundVariable.value,
      })
    } else if (!foundVariable && resolvedVariable) {
      setResolvedVariable(null)
    }
    // Prevent infinite loop
  }, [
    activeEnvironment.data,
    resolvedVariable,
    variableNameWithoutCurlyBraces,
    activeEnvironmentDict,
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
