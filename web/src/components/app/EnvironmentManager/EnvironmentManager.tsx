import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import DeselectIcon from '@mui/icons-material/Deselect'
import LayersClearIcon from '@mui/icons-material/LayersClear'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'

import {
  activeEnvironmentVar,
  generateLocalEnvironment,
  localEnvironmentsVar,
  LocalProject,
} from 'src/contexts/reactives'

import {
  KeyValueEditor,
  KeyValueItem,
} from '../collectionEditor/KeyValueEditor'

import { CreateEnvironmentDialog } from './CreateEnvironmentDialog'

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
  const theme = useTheme()
  const allEnvironments = useReactiveVar(localEnvironmentsVar)
  const activeEnvironmentId = useReactiveVar(activeEnvironmentVar)
  const [showCreateEnvironmentDialog, setShowCreateEnvironmentDialog] =
    useState(false)
  const [keyValues, setKeyValues] = useState([] as KeyValueItem[])

  useEffect(() => {
    if (!activeEnvironmentId) {
      setKeyValues([])
    }

    const localEnvironments = allEnvironments.filter(
      (env) => env.parentId === project.id
    )

    const variables =
      localEnvironments.find((env) => env.id === activeEnvironmentId)
        ?.variables || []
    setKeyValues(
      variables.map((variable, index) => ({ id: index, ...variable }))
    )
  }, [allEnvironments, activeEnvironmentId, project.id])

  const localEnvironments = allEnvironments.filter(
    (env) => env.parentId === project.id
  )

  const currentEnvironment = localEnvironments.find(
    (env) => env.id === activeEnvironmentId
  )

  const handleEnvironmentSave = (newKeyValues: KeyValueItem[]) => {
    const environment =
      localEnvironments.find((env) => env.id === activeEnvironmentId) || null

    if (environment) {
      environment.variables = newKeyValues
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

  const handleEnvironmentCreate = (name: string) => {
    const newEnvironment = generateLocalEnvironment({
      name,
      parentId: project.id,
      __parentTypename: project.__typename,
    })

    localEnvironmentsVar(
      [...localEnvironments, newEnvironment].sort(
        (a, b) => a?.createdAt.getTime() - b?.createdAt.getTime()
      )
    )
  }

  const needSave =
    JSON.stringify(keyValues) !== JSON.stringify(currentEnvironment) &&
    currentEnvironment

  return (
    <>
      <CreateEnvironmentDialog
        show={showCreateEnvironmentDialog}
        setShowCallback={setShowCreateEnvironmentDialog}
        onCreate={handleEnvironmentCreate}
      />
      <Dialog
        open={show}
        onClose={() => setShowCallback(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Environments</DialogTitle>
        <DialogContent style={{ minHeight: '450px' }}>
          {localEnvironments.length === 0 ? (
            <Stack
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <LayersClearIcon
                sx={{
                  marginBottom: 2,
                  width: 80,
                  height: 80,
                  color: theme.palette.action.disabled,
                }}
              />
              <Typography variant="h6">
                Looks like nothings here yet 😢
              </Typography>
              <Typography
                variant="caption"
                color={theme.palette.text.secondary}
              >
                Add an environment to use variables in requests
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowCreateEnvironmentDialog(true)}
              >
                Create Environment
              </Button>
            </Stack>
          ) : (
            <Stack direction="row">
              <Stack
                sx={{
                  minWidth: '200px',
                  maxWidth: '400px',
                  overflow: 'auto',
                }}
              >
                {localEnvironments.map((environment, index) => (
                  <Button
                    key={index}
                    variant={
                      environment.id === activeEnvironmentId
                        ? 'contained'
                        : 'text'
                    }
                    onClick={() => activeEnvironmentVar(environment.id)}
                  >
                    {environment.name}
                  </Button>
                ))}
              </Stack>
              <Stack>
                {activeEnvironmentId ? (
                  <>
                    <KeyValueEditor items={keyValues} setItems={setKeyValues} />
                    <Button
                      variant="contained"
                      color="success"
                      disabled={!needSave}
                      onClick={() => handleEnvironmentSave(keyValues)}
                    >
                      Save
                    </Button>
                    <Button>Delete Environment</Button>
                  </>
                ) : (
                  <Stack
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  ></Stack>
                )}
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
