import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import DeselectIcon from '@mui/icons-material/Deselect'
import LayersClearIcon from '@mui/icons-material/LayersClear'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
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

    const isFirstEnvironment = localEnvironments.length === 0

    localEnvironmentsVar(
      [...localEnvironments, newEnvironment].sort(
        (a, b) => a?.createdAt.getTime() - b?.createdAt.getTime()
      )
    )

    if (isFirstEnvironment) {
      activeEnvironmentVar(newEnvironment.id)
    }
  }

  const handleEnvironmentDelete = () => {
    const newEnvironments = localEnvironments
      .filter((env) => env.id !== activeEnvironmentId)
      .sort((a, b) => a?.createdAt.getTime() - b?.createdAt.getTime())

    if (currentEnvironment?.id === activeEnvironmentId) {
      activeEnvironmentVar(null)
    }

    localEnvironmentsVar(newEnvironments)
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
        <Divider color={theme.palette.divider} />
        <DialogContent
          style={{ height: '500px', paddingTop: 0, paddingBottom: 3 }}
        >
          {localEnvironments.length === 0 ? (
            <Stack
              sx={{
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
                sx={{
                  marginTop: 2,
                }}
              >
                Create Environment
              </Button>
            </Stack>
          ) : (
            <Stack
              direction="row"
              sx={{
                height: '100%',
              }}
              spacing={3}
            >
              <Stack
                sx={{
                  minWidth: '200px',
                  maxWidth: '400px',
                  overflow: 'auto',
                  paddingY: 3,
                }}
                spacing={2}
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
                <Divider color={theme.palette.divider} />
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setShowCreateEnvironmentDialog(true)}
                >
                  Create Environment
                </Button>
              </Stack>
              <Divider
                orientation="vertical"
                flexItem
                color={theme.palette.divider}
              />
              <Stack
                sx={{
                  paddingY: 3,
                  width: '100%',
                }}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                {activeEnvironmentId ? (
                  <>
                    <KeyValueEditor items={keyValues} setItems={setKeyValues} />
                    <Stack spacing={2} direction="row">
                      <Button
                        variant="contained"
                        color="success"
                        disabled={!needSave}
                        onClick={() => handleEnvironmentSave(keyValues)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleEnvironmentDelete}
                      >
                        Delete Environment
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <Stack
                    sx={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <DeselectIcon
                      sx={{
                        marginBottom: 2,
                        width: 80,
                        height: 80,
                        color: theme.palette.action.disabled,
                      }}
                    />
                    <Typography variant="h6">
                      No environment selected
                    </Typography>
                    <Typography
                      variant="caption"
                      color={theme.palette.text.secondary}
                    >
                      Select an environment to use variables in requests
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
