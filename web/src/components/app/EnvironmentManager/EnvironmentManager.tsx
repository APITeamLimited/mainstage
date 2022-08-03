import { useEffect, useState } from 'react'

import * as Y from '/home/harry/Documents/APITeam/mainstage/node_modules/yjs'

import { useReactiveVar } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import DeselectIcon from '@mui/icons-material/Deselect'
import LayersClearIcon from '@mui/icons-material/LayersClear'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { Environment } from 'types/src'
import { v4 as uuid } from 'uuid'
import { useYMap } from 'zustand-yjs'

import {
  useActiveEnvironmentYMap,
  useBranchYMap,
  useEnvironments,
  useEnvironmentsYMap,
} from 'src/contexts/EnvironmentProvider'
import { activeEnvironmentVar } from 'src/contexts/reactives'

import {
  KeyValueEditor,
  KeyValueItem,
} from '../collectionEditor/KeyValueEditor'

import { CreateEnvironmentDialog } from './CreateEnvironmentDialog'

type EnvironmentManagerProps = {
  show: boolean
  setShowCallback: (show: boolean) => void
}

export const EnvironmentManager = ({
  show,
  setShowCallback,
}: EnvironmentManagerProps) => {
  const theme = useTheme()
  const environmentsHook = useEnvironments()
  const environments = Object.values(environmentsHook.data) as Environment[]
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironment = useYMap(activeEnvironmentYMap || new Y.Map())
  const environmentsYMap = useEnvironmentsYMap()
  const branchYMap = useBranchYMap()
  const activeEnvironmentVarData = useReactiveVar(activeEnvironmentVar)
  const [showCreateEnvironmentDialog, setShowCreateEnvironmentDialog] =
    useState(false)
  const [keyValues, setKeyValues] = useState([] as KeyValueItem[])
  const [needSave, setNeedSave] = useState(false)

  useEffect(() => {
    setKeyValues(activeEnvironmentYMap?.get('variables') || [])
  }, [activeEnvironmentYMap])

  const activeEnvironmentId =
    activeEnvironmentVarData[branchYMap?.get('id')] || null

  //console.log(
  //  'activeEnvironment',
  //  branchYMap?.get('id'),
  //  activeEnvironmentId,
  //  activeEnvironmentVarData,
  //  activeEnvironment.data
  //)

  const handleEnvironmentSave = (newKeyValues: KeyValueItem[]) => {
    console.log('saving', keyValues)

    if (!activeEnvironmentYMap) throw 'No active environment'
    activeEnvironmentYMap.set('variables', newKeyValues)
    activeEnvironmentYMap.set('updatedAt', new Date().toISOString())

    const clone = activeEnvironmentYMap.clone()
    const parent = environmentsYMap?.parent
    if (!parent) throw 'No parent'
    const id = activeEnvironmentYMap.get('id')
    parent.delete(id)
    parent.set(id, clone)
    console.log('saved', clone)
    setNeedSave(false)

    console.log(parent.get(id))
  }

  useEffect(() => {
    setNeedSave(
      JSON.stringify(keyValues) !==
        JSON.stringify(activeEnvironmentYMap?.get('variables') || [])
    )
  }, [activeEnvironmentYMap, keyValues])

  const handleEnvironmentCreate = (name: string) => {
    if (!environmentsYMap) throw 'No environmentsYMap'

    const newId = uuid()

    const newEnvironmentYMap = new Y.Map()

    newEnvironmentYMap.set('id', newId)
    newEnvironmentYMap.set('name', name)
    newEnvironmentYMap.set('variables', [])
    newEnvironmentYMap.set('createdAt', new Date().toISOString())
    newEnvironmentYMap.set('updatedAt', null)

    environmentsYMap.set(newId, newEnvironmentYMap)

    const isFirstEnvironment = environments.length === 0

    if (isFirstEnvironment) {
      activeEnvironmentVar({
        ...activeEnvironmentVarData,
        [branchYMap?.get('id')]: newId,
      })
    }
  }

  const handleEnvironmentDelete = () => {
    if (!activeEnvironmentYMap) throw 'No active environment'
    if (!environmentsYMap) throw 'No environmentsYMap'

    environmentsYMap?.delete(activeEnvironmentYMap.get('id'))

    activeEnvironmentVar({
      ...activeEnvironmentVarData,
      [branchYMap?.get('id')]: null,
    })
  }

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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            width: '100%',
          }}
        >
          <DialogTitle>Environments</DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              marginRight: 2,
            }}
          >
            {activeEnvironmentId && (
              <Tooltip title="Deselect Environment">
                <IconButton
                  onClick={() => {
                    activeEnvironmentVar({
                      ...activeEnvironmentVarData,
                      [branchYMap.get('id')]: null,
                    })
                  }}
                  sx={{
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <DeselectIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Close">
              <IconButton
                onClick={() => setShowCallback(false)}
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Divider color={theme.palette.divider} />
        <DialogContent
          style={{ height: '500px', paddingTop: 0, paddingBottom: 3 }}
        >
          {environments.length === 0 ? (
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
                Add an environment to use its variables in requests
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
                {environments.map((environment, index) => (
                  <Button
                    key={index}
                    variant={
                      environment.id === activeEnvironmentId
                        ? 'contained'
                        : 'text'
                    }
                    onClick={() => {
                      activeEnvironmentVar({
                        ...activeEnvironmentVarData,
                        [branchYMap.get('id')]: environment.id,
                      })
                    }}
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
                    <KeyValueEditor
                      items={keyValues}
                      setItems={setKeyValues}
                      namespace={`env${activeEnvironmentId}`}
                      enableEnvironmentVariables={false}
                    />
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
                      width: '100%',
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
                      Select an environment to use its variables in requests
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
