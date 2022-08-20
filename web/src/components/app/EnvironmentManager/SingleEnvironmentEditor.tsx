import { useEffect, useState } from 'react'

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
import { KeyValueItem } from 'types/src'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { activeEnvironmentVar } from 'src/contexts/reactives'

import { KeyValueEditor } from '../collection-editor/KeyValueEditor'
import { QueryDeleteDialog } from '../dialogs/QueryDeleteDialog'

type SingleEnvironmentEditorProps = {
  environmentYMap: Y.Map<any>
  show: boolean
  setShow: (show: boolean) => void
}

export const SingleEnvironmentEditor = ({
  environmentYMap,
  show,
  setShow,
}: SingleEnvironmentEditorProps) => {
  const environment = useYMap(environmentYMap)
  const theme = useTheme()
  const [showQueryDeleteDialog, setShowQueryDeleteDialog] = useState(false)
  const [keyValues, setKeyValues] = useState([] as KeyValueItem[])
  const [needSave, setNeedSave] = useState(false)
  const activeEnvironmentVarData = useReactiveVar(activeEnvironmentVar)

  useEffect(() => {
    if (environment.data.variables) {
      setKeyValues(environment.data.variables)
    }
  }, [environment.data])

  useEffect(() => {
    setKeyValues(environmentYMap?.get('variables') || [])
  }, [environmentYMap])

  useEffect(() => {
    setNeedSave(
      JSON.stringify(keyValues) !==
        JSON.stringify(environmentYMap?.get('variables') || [])
    )
  }, [environmentYMap, keyValues])

  const handleEnvironmentSave = (newKeyValues: KeyValueItem[]) => {
    if (!environmentYMap) throw 'No active environment'
    environmentYMap.set('variables', newKeyValues)
    environmentYMap.set('updatedAt', new Date().toISOString())

    setNeedSave(false)
  }
  const environmentId = environment.data.id

  const handleEnvironmentDelete = () => {
    if (!environmentYMap) throw 'No active environment'
    const environmentsYMap = environmentYMap.parent
    if (!environmentsYMap) throw 'No environmentsYMap'

    environmentsYMap?.delete(environmentId)

    activeEnvironmentVar({
      ...activeEnvironmentVarData,
      [branchYMap?.get('id')]: null,
    })
  }

  return (
    <>
      <QueryDeleteDialog
        show={showQueryDeleteDialog}
        onClose={() => setShowQueryDeleteDialog(false)}
        onDelete={handleEnvironmentDelete}
        title="Delete Environment"
        description="Are you sure you want to delete this environment?"
      />
      <Dialog
        open={show}
        onClose={() => setShow(false)}
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
                onClick={() => setShow(false)}
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
            paddingY: 3,
          }}
        >
          <Stack
            sx={{
              width: '100%',
              height: '100%',
            }}
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <KeyValueEditor
              items={keyValues}
              setItems={setKeyValues}
              namespace={`env-${environmentId}`}
              enableEnvironmentVariables={false}
            />
            <Box sx={{ marginTop: 3 }} />
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
