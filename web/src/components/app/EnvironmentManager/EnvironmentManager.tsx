import { useEffect, useMemo, useState } from 'react'

import {
  KeyValueItem,
  kvExporter,
  kvLegacyImporter,
  LocalValueKV,
} from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import DeselectIcon from '@mui/icons-material/Deselect'
import LayersClearIcon from '@mui/icons-material/LayersClear'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material'

import {
  useActiveEnvironmentYMap,
  useBranchYMap,
  useEnvironmentsYMap,
} from 'src/contexts/EnvironmentProvider'
import { useHashSumModule, useYJSModule } from 'src/contexts/imports'
import {
  activeEnvironmentVar,
  getBranchEnvironmentKey,
  updateActiveEnvironmentId,
} from 'src/contexts/reactives'
import { createEnvironment } from 'src/entity-engine/creators'
import { useYMap } from 'src/lib/zustand-yjs'

import { QueryDeleteDialog } from '../dialogs/QueryDeleteDialog'
import { KeyValueEditor } from '../KeyValueEditor'
import { EmptyPanelMessage } from '../utils/EmptyPanelMessage'

import { CreateEnvironmentDialog } from './CreateEnvironmentDialog'

type EnvironmentManagerProps = {
  show: boolean
  setShowCallback: (show: boolean) => void
}

export const EnvironmentManager = ({
  show,
  setShowCallback,
}: EnvironmentManagerProps) => {
  const Y = useYJSModule()
  const { default: hash } = useHashSumModule()

  const theme = useTheme()

  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironmentHook = useYMap(activeEnvironmentYMap ?? new Y.Map())
  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)

  const environmentsYMap = useEnvironmentsYMap()
  useYMap(environmentsYMap ?? new Y.Map())

  const branchYMap = useBranchYMap()
  const branchHook = useYMap(branchYMap ?? new Y.Map())

  const [unsavedKeyValues, setUnsavedKeyValues] = useState(
    [] as KeyValueItem<LocalValueKV>[]
  )

  const [needSave, setNeedSave] = useState(false)

  const [showCreateEnvironmentDialog, setShowCreateEnvironmentDialog] =
    useState(false)
  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)

  const activeEnvironmentId = useMemo(
    () => activeEnvironmentDict[getBranchEnvironmentKey(branchYMap)] ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEnvironmentDict, branchHook]
  )

  // If doesn't need save, update fields automatically
  useEffect(() => {
    if (!needSave && activeEnvironmentYMap) {
      const newKeyValues = kvLegacyImporter<LocalValueKV>(
        'variables',
        activeEnvironmentYMap,
        'localvalue'
      )

      // This is necessary to prevent a feedback loop
      if (hash(newKeyValues) !== hash(unsavedKeyValues)) {
        setUnsavedKeyValues(newKeyValues)

        // This seems to be required to trigger re-render
        setNeedSave(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEnvironmentHook])

  // Load the variables again when the dialog is opened or active environment changes
  useEffect(() => {
    if (!activeEnvironmentId) {
      setUnsavedKeyValues([])
      return
    }

    if (show && activeEnvironmentId && activeEnvironmentYMap) {
      const newKeyValues = kvLegacyImporter<LocalValueKV>(
        'variables',
        activeEnvironmentYMap,
        'localvalue'
      )

      // This is necessary to prevent a feedback loop
      if (hash(newKeyValues) !== hash(unsavedKeyValues)) {
        setUnsavedKeyValues(newKeyValues)
      }

      // This seems to be required to trigger re-render
      setNeedSave(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, activeEnvironmentId, activeEnvironmentYMap])

  const handleEnvironmentSave = (
    newKeyValues: KeyValueItem<LocalValueKV>[]
  ) => {
    if (!activeEnvironmentYMap) throw 'No active environment'
    activeEnvironmentYMap.set(
      'variables',
      kvExporter<LocalValueKV>(
        newKeyValues,
        'localvalue',
        activeEnvironmentYMap.doc?.guid as string
      )
    )
    activeEnvironmentYMap.set('updatedAt', new Date().toISOString())

    setNeedSave(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  const handleFieldUpdate = <T extends any>(
    setter: (value: T) => void,
    newValue: T
  ) => {
    if (!needSave) {
      setNeedSave(true)
    }

    // Call the setter after the needSave state is set to true else will try and
    // update fields automatically
    setter(newValue)
  }

  const handleEnvironmentCreate = (name: string) => {
    if (!environmentsYMap) throw 'No environmentsYMap'

    const isFirstEnvironment = environmentsYMap.size === 0

    const { environment, environmentId } = createEnvironment(name, Y)

    environmentsYMap.set(environmentId, environment)

    if (isFirstEnvironment) {
      updateActiveEnvironmentId(
        activeEnvironmentDict,
        branchYMap,
        environmentId
      )
    }
  }

  const handleEnvironmentDelete = () => {
    if (!activeEnvironmentYMap) throw 'No active environment'
    if (!environmentsYMap) throw 'No environmentsYMap'

    environmentsYMap?.delete(activeEnvironmentYMap.get('id'))

    updateActiveEnvironmentId(activeEnvironmentDict, branchYMap, null)
  }

  return (
    <>
      <CreateEnvironmentDialog
        show={showCreateEnvironmentDialog}
        setShowCallback={setShowCreateEnvironmentDialog}
        onCreate={handleEnvironmentCreate}
      />
      <QueryDeleteDialog
        show={showQueryDeleteDialog}
        onClose={() => setShowQueryDeleteDialog(false)}
        onDelete={handleEnvironmentDelete}
        title="Delete Environment"
        description="Are you sure you want to delete this environment?"
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
                  onClick={() =>
                    updateActiveEnvironmentId(
                      activeEnvironmentDict,
                      branchYMap,
                      null
                    )
                  }
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
          sx={{
            height: '500px',
            padding: 0,
            maxWidth: '100%',
          }}
        >
          {environmentsYMap.size === 0 ? (
            <EmptyPanelMessage
              primaryText="Looks like nothings here yet"
              secondaryMessages={[
                'Add an environment to use its variables in requests',
              ]}
              icon={
                <LayersClearIcon
                  sx={{
                    marginBottom: 2,
                    width: 80,
                    height: 80,
                    color: theme.palette.action.disabled,
                  }}
                />
              }
            >
              <Button
                variant="outlined"
                onClick={() => setShowCreateEnvironmentDialog(true)}
                sx={{
                  marginTop: 2,
                }}
              >
                Create Environment
              </Button>
            </EmptyPanelMessage>
          ) : (
            <Stack
              direction="row"
              sx={{
                height: '100%',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <Stack
                sx={{
                  minWidth: '200px',
                  maxWidth: '400px',
                  overflow: 'auto',
                  padding: 2,
                }}
                spacing={2}
              >
                {Array.from(environmentsYMap.values()).map(
                  (environment, index) => (
                    <Button
                      key={index}
                      variant={
                        environment.get('id') ===
                        activeEnvironmentDict[
                          getBranchEnvironmentKey(branchYMap)
                        ]
                          ? 'contained'
                          : 'text'
                      }
                      onClick={() => {
                        updateActiveEnvironmentId(
                          activeEnvironmentDict,
                          branchYMap,
                          environment.get('id')
                        )
                      }}
                    >
                      {environment.get('name')}
                    </Button>
                  )
                )}
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
                  width: '100%',
                  height: 'calc(100% - 2em)',
                  padding: 2,
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
                justifyContent="space-between"
                alignItems="flex-end"
              >
                {activeEnvironmentId ? (
                  <>
                    <KeyValueEditor<LocalValueKV>
                      items={unsavedKeyValues}
                      setItems={(newItems) =>
                        handleFieldUpdate<KeyValueItem<LocalValueKV>[]>(
                          setUnsavedKeyValues,
                          newItems
                        )
                      }
                      namespace={`env${activeEnvironmentId}`}
                      enableEnvironmentVariables={false}
                      disableBulkEdit
                      variant="localvalue"
                    />
                    <Box sx={{ marginTop: 2 }} />
                    <Stack spacing={2} direction="row">
                      <Button
                        variant="contained"
                        color="success"
                        disabled={!needSave}
                        onClick={() => handleEnvironmentSave(unsavedKeyValues)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setShowQueryDeleteDialog(true)}
                      >
                        Delete Environment
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <EmptyPanelMessage
                    primaryText="No active environment"
                    secondaryMessages={[
                      'Select an environment to use its variables in requests',
                    ]}
                    icon={
                      <DeselectIcon
                        sx={{
                          marginBottom: 2,
                          width: 80,
                          height: 80,
                          color: theme.palette.action.disabled,
                        }}
                      />
                    }
                  />
                )}
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
