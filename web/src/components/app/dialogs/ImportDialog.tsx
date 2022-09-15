import { useState } from 'react'

import { Project } from '@apiteam/types'
import { makeVar, useReactiveVar } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  TextField,
  Stack,
  Box,
  Tooltip,
  IconButton,
  Card,
  useTheme,
} from '@mui/material'

import { MonacoEditor } from '../collection-editor/MonacoEditor'
import { FileDropzone } from '../utils/FileDropzone'
import { SecondaryChips } from '../utils/SecondaryChips'

type ImportDialogState = {
  isOpen: boolean
  project: Project | null
}

const intitialImportDialogState: ImportDialogState = {
  isOpen: false,
  project: null,
}

export const importDialogStateVar = makeVar(intitialImportDialogState)

export const ImportDialog = () => {
  const theme = useTheme()

  const { isOpen, project } = useReactiveVar(importDialogStateVar)
  const [activeTab, setActiveTab] = useState(0)
  const [rawText, setRawText] = useState('')

  const handleClose = () => {
    importDialogStateVar({ isOpen: false, project: null })
    setActiveTab(0)
    setRawText('')
  }

  const handleImport = () => {}

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          width: '100%',
        }}
      >
        <DialogTitle>Import</DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
            marginRight: 2,
          }}
        >
          <CloseIcon />
        </IconButton>
      </Stack>
      <DialogContent
        sx={{
          pt: 0,
        }}
      >
        <Stack
          spacing={2}
          sx={{
            height: '400px',
          }}
        >
          <SecondaryChips
            names={['Raw Text', 'File']}
            value={activeTab}
            onChange={setActiveTab}
          />
          {activeTab === 0 && (
            <Card
              sx={{
                backgroundColor: theme.palette.background.paper,
                height: '100%',
                py: 2,
              }}
              elevation={0}
            >
              <MonacoEditor
                value={rawText}
                onChange={setRawText}
                language="plaintext"
                namespace="import-dialog"
                enableMinimap={false}
                placeholder={[
                  'Paste raw text here',
                  '',
                  'Supported formats:',
                  '- Postman Collection',
                  '- OpenAPI',
                ]}
                topPlaceholderFudgeFactor={127}
              />
            </Card>
          )}
          {activeTab === 1 && <FileDropzone primaryText="Drop file here" />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          disabled={activeTab === 0 ? rawText.length === 0 : true}
          variant="contained"
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}
