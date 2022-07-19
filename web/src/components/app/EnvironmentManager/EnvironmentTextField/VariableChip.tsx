import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Chip, Tooltip, useTheme } from '@mui/material'

import {
  activeEnvironmentVar,
  localEnvironmentsVar,
} from 'src/contexts/reactives'

type VariableChipProps = {
  variableName: string
}

type ResolvedVariable =
  | {
      sourceName: string
      sourceTypename: 'LocalEnvironment'
      value: string
    }
  | null
  | undefined

export const VariableChip = ({ variableName }: VariableChipProps) => {
  const [variableNameWithoutCurlyBraces, setVariableNameWithoutCurlyBraces] =
    useState(variableName.replace(/^\{/, '').replace(/\}$/, ''))

  const [resolvedVariable, setResolvedVariable] =
    useState<ResolvedVariable>(undefined)

  const localEnvironments = useReactiveVar(localEnvironmentsVar)
  const activeEnvironmentId = useReactiveVar(activeEnvironmentVar)
  const theme = useTheme()

  useEffect(() => {
    setVariableNameWithoutCurlyBraces(
      variableName.replace(/^\{/, '').replace(/\}$/, '')
    )
  }, [variableName])

  useEffect(() => {
    const currentEnvironment = localEnvironments.find(
      (env) => env.id === activeEnvironmentId
    )

    if (currentEnvironment) {
      const foundVariable = currentEnvironment.variables.find(
        (variable) => variable.keyString === variableNameWithoutCurlyBraces
      )

      if (foundVariable) {
        setResolvedVariable({
          sourceName: currentEnvironment.name,
          sourceTypename: 'LocalEnvironment',
          value: foundVariable.value,
        })
        return
      }
    }
    setResolvedVariable(null)
  }, [localEnvironments, activeEnvironmentId, variableNameWithoutCurlyBraces])

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
