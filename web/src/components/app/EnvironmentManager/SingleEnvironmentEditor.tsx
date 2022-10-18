/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import {
  KeyValueItem,
  kvExporter,
  kvLegacyImporter,
  LocalValueKV,
} from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
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
import type { Map as YMap } from 'yjs'

import { useHashSumModule } from 'src/contexts/imports'
import {
  activeEnvironmentVar,
  updateActiveEnvironmentId,
} from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

import { QueryDeleteDialog } from '../dialogs/QueryDeleteDialog'
import { KeyValueEditor } from '../KeyValueEditor'

type SingleEnvironmentEditorProps = {
  environmentYMap: YMap<any>
  show: boolean
  setShow: (show: boolean) => void
}

export const SingleEnvironmentEditor = ({
  environmentYMap,
  show,
  setShow,
}: SingleEnvironmentEditorProps) => {
  const { default: hash } = useHashSumModule()

  const theme = useTheme()
  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)

  const environmentHook = useYMap(environmentYMap)
  const environmentId = useMemo(
    () => environmentYMap.get('id'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [environmentHook]
  )
  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)

  const [unsavedKeyValues, setUnsavedKeyValues] = useState(
    kvLegacyImporter<LocalValueKV>('variables', environmentYMap, 'localvalue')
  )

  const [needSave, setNeedSave] = useState(false)

  // If doesn't need save, update fields automatically
  useEffect(() => {
    if (!needSave) {
      const newKeyValues = kvLegacyImporter<LocalValueKV>(
        'variables',
        environmentYMap,
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
  }, [environmentHook])

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

  const handleEnvironmentSave = (
    newKeyValues: KeyValueItem<LocalValueKV>[]
  ) => {
    if (!environmentYMap) throw 'No active environment'
    environmentYMap.set(
      'variables',
      kvExporter<LocalValueKV>(
        newKeyValues,
        'localvalue',
        environmentYMap.doc?.guid as string
      )
    )
    environmentYMap.set('updatedAt', new Date().toISOString())

    setNeedSave(false)
  }
  const handleEnvironmentDelete = () => {
    if (!environmentYMap) throw 'No active environment'
    const environmentsYMap = environmentYMap.parent as YMap<any> | undefined
    if (!environmentsYMap) throw 'No environmentsYMap'

    const branchYMap = environmentsYMap.parent as YMap<any> | undefined
    if (!branchYMap) throw 'No branchYMap'

    environmentsYMap.delete(environmentId)
    updateActiveEnvironmentId(activeEnvironmentDict, branchYMap, null)
  }

  // Reset the variables when the dialog is closed
  const handleClose = () => {
    setUnsavedKeyValues([])
    setShow(false)
  }

  // Load the variables again when the dialog is opened
  useEffect(() => {
    if (show) {
      setNeedSave(false)
      setUnsavedKeyValues(
        kvLegacyImporter('variables', environmentYMap, 'localvalue')
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  return (
    <>
      <QueryDeleteDialog
        show={showQueryDeleteDialog}
        onClose={() => setShowQueryDeleteDialog(false)}
        onDelete={handleEnvironmentDelete}
        title="Delete Environment"
        description="Are you sure you want to delete this environment?"
      />
      <Dialog open={show} onClose={handleClose} fullWidth maxWidth="lg">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            width: '100%',
          }}
        >
          <DialogTitle>Environment - {environmentYMap.get('name')}</DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              marginRight: 2,
            }}
          >
            <Tooltip title="Close">
              <IconButton
                onClick={handleClose}
                sx={{
                  color: theme.palette.grey[500],
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
            padding: 2,
          }}
        >
          <Stack
            sx={{
              width: '100%',
              height: '100%',
              maxHeight: '100%',
              maxWidth: '100%',
            }}
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <KeyValueEditor<LocalValueKV>
              items={unsavedKeyValues}
              setItems={(newItems) =>
                handleFieldUpdate<KeyValueItem<LocalValueKV>[]>(
                  setUnsavedKeyValues,
                  newItems
                )
              }
              namespace={`env-${environmentId}`}
              enableEnvironmentVariables={false}
              variant="localvalue"
              disableBulkEdit
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
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
