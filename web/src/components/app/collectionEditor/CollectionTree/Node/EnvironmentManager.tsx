import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'

import {
  activeEnvironmentVar,
  localEnvironmentsVar,
  LocalProject,
} from 'src/contexts/reactives'

import { KeyValueEditor, KeyValueItem } from '../../KeyValueEditor'

type EnvironmentManagerProps = {
  project: LocalProject
  show: boolean
  setShowCallback: (show: boolean) => void
}

export const EnvironmentManager = ({
  project,
  show,
  setShowCallback,
}: EnvironmentManagerProps) => {
  const allEnvironments = useReactiveVar(localEnvironmentsVar)
  const activeEnvironmentId = useReactiveVar(activeEnvironmentVar)
  const localEnvironments = allEnvironments.filter(
    (env) => env.parentId === project.id
  )

  const [keyValues, setKeyValues] = useState([] as KeyValueItem[])

  useEffect(() => {
    if (!activeEnvironmentId) {
      setKeyValues([])
    }
    const variables =
      localEnvironments.find((env) => env.id === activeEnvironmentId)
        ?.variables || []
    setKeyValues(
      variables.map((variable, index) => ({ id: index, ...variable }))
    )
  }, [localEnvironments, activeEnvironmentId])

  const handleEnvironmentSave = (newKeyValues: KeyValueItem[]) => {
    const variables = newKeyValues.map((newKeyValue) => ({
      keyString: newKeyValue.keyString,
      value: newKeyValue.value,
      enabled: newKeyValue.enabled,
    }))
    const environment =
      localEnvironments.find((env) => env.id === activeEnvironmentId) || null

    if (environment) {
      environment.variables = variables
    } else if (activeEnvironmentId && !environment) {
      throw `Environment with id ${activeEnvironmentId} not found`
    }

    if (!environment) {
      throw `Could not find environment with id ${activeEnvironmentId}`
    }

    localEnvironmentsVar(
      [
        ...localEnvironments.filter((env) => env.id !== activeEnvironmentId),
        environment,
      ].sort((a, b) => a?.createdAt.getTime() - b?.createdAt.getTime())
    )
  }

  return (
    <Dialog
      open={show}
      onClose={() => setShowCallback(false)}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>Environments</DialogTitle>
      <DialogContent>
        <Stack direction="row">
          <Stack
            sx={{
              minWidth: '200px',
              maxWidth: '400px',
              overflow: 'auto',
            }}
          >
            <Typography variant="h6">Project Environments</Typography>
            {localEnvironments.map((environment, index) => (
              <Button
                key={index}
                variant={
                  environment.id === activeEnvironmentId ? 'contained' : 'text'
                }
                onClick={() => activeEnvironmentVar(environment.id)}
              >
                {environment.name}
              </Button>
            ))}
          </Stack>
          <Stack>
            <KeyValueEditor
              items={keyValues}
              setItems={handleEnvironmentSave}
            />
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
