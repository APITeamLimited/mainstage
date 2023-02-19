import { useEffect, useMemo, useState } from 'react'

import { KeyValueItem } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import DeselectIcon from '@mui/icons-material/Deselect'
import LayersClearIcon from '@mui/icons-material/LayersClear'
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material'

import { CustomDialog } from 'src/components/custom-mui'
import {
  useActiveEnvironmentYMap,
  useBranchYMap,
  useEnvironmentsYMap,
} from 'src/contexts/EnvironmentProvider'
import {
  useHashSumModule,
  useSimplebarReactModule,
  useYJSModule,
} from 'src/contexts/imports'
import {
  activeEnvironmentVar,
  getBranchEnvironmentKey,
  updateActiveEnvironmentId,
} from 'src/contexts/reactives'
import { createEnvironment } from 'src/entity-engine/creators'
import { useYMap } from 'src/lib/zustand-yjs'
import { kvExporter, kvLegacyImporter } from 'src/utils/key-values'

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
  const { default: SimpleBar } = useSimplebarReactModule()

  const theme = useTheme()

  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironmentHook = useYMap(activeEnvironmentYMap ?? new Y.Map())
  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)

  const environmentsYMap = useEnvironmentsYMap()
  useYMap(environmentsYMap ?? new Y.Map())

  const branchYMap = useBranchYMap()
  const branchHook = useYMap(branchYMap ?? new Y.Map())

  const [unsavedKeyValues, setUnsavedKeyValues] = useState([] as KeyValueItem[])

  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  const [needSave, setNeedSave] = useState(false)

  const [showCreateEnvironmentDialog, setShowCreateEnvironmentDialog] =
    useState(false)
  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)

  const [querySwitchToId, setQueryquerySwitchToId] = useState('')

  const activeEnvironmentId = useMemo(
    () => activeEnvironmentDict[getBranchEnvironmentKey(branchYMap)] ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEnvironmentDict, branchHook]
  )

  // If doesn't need save, update fields automatically
  useEffect(() => {
    // Check if deleted, if so, clear active environment
    if (activeEnvironmentId && !environmentsYMap.has(activeEnvironmentId)) {
      updateActiveEnvironmentId(activeEnvironmentDict, branchYMap, null)
    }

    if (!needSave && activeEnvironmentYMap) {
      const newKeyValues = kvLegacyImporter(
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
      setActionArea(<></>)
      return
    }

    if (show && activeEnvironmentId && activeEnvironmentYMap) {
      const newKeyValues = kvLegacyImporter(
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

  const handleEnvironmentSave = (newKeyValues: KeyValueItem[]) => {
    if (!activeEnvironmentYMap) throw 'No active environment'
    activeEnvironmentYMap.set(
      'variables',
      kvExporter(
        newKeyValues,
        'localvalue',
        activeEnvironmentYMap.doc?.guid as string
      )
    )
    activeEnvironmentYMap.set('updatedAt', new Date().toISOString())

    setNeedSave(false)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint, @typescript-eslint/no-explicit-any
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
      <QueryDeleteDialog
        show={querySwitchToId !== ''}
        onClose={() => setQueryquerySwitchToId('')}
        onDelete={() =>
          updateActiveEnvironmentId(
            activeEnvironmentDict,
            branchYMap,
            querySwitchToId
          )
        }
        title="Switch Environment"
        description="Switching environment will discard any unsaved changes. Are you sure you want to switch?"
        deleteButtonLabel="Switch"
      />
      <CustomDialog
        open={show}
        onClose={() => setShowCallback(false)}
        fullWidth
        maxWidth="lg"
        title="Environment"
        disableScroll
        actionArea={
          <>
            {actionArea}
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
                    color: theme.palette.grey[500],
                  }}
                >
                  <DeselectIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
        }
        dialogActions={
          activeEnvironmentId && (
            <>
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
            </>
          )
        }
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
                      activeEnvironmentDict[getBranchEnvironmentKey(branchYMap)]
                        ? 'contained'
                        : 'text'
                    }
                    onClick={() => {
                      if (needSave) {
                        setQueryquerySwitchToId(environment.get('id'))
                      } else {
                        updateActiveEnvironmentId(
                          activeEnvironmentDict,
                          branchYMap,
                          environment.get('id')
                        )
                      }
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
            <div
              style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {activeEnvironmentId ? (
                <SimpleBar
                  style={{
                    height: '100%',
                    maxHeight: '100%',
                    width: '100%',
                  }}
                >
                  <KeyValueEditor
                    items={unsavedKeyValues}
                    setItems={(newItems) =>
                      handleFieldUpdate<KeyValueItem[]>(
                        setUnsavedKeyValues,
                        newItems
                      )
                    }
                    namespace={`env${activeEnvironmentId}`}
                    enableEnvironmentVariables={false}
                    disableBulkEdit
                    variant="localvalue"
                    setActionArea={setActionArea}
                    disableScroll
                  />
                  <Box sx={{ height: '12px' }} />
                </SimpleBar>
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
            </div>
          </Stack>
        )}
      </CustomDialog>
    </>
  )
}
