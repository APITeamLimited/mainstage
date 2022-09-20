import { useMemo, useState } from 'react'

import { Project } from '@apiteam/types'
import { makeVar, useReactiveVar } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Stack,
  IconButton,
  Card,
  useTheme,
  Typography,
  Grid,
  Box,
  Chip,
} from '@mui/material'

import { useWorkspace } from 'src/entity-engine'
import {
  useRawBearer,
  useScopeId,
  useWorkspaceInfo,
} from 'src/entity-engine/EntityEngine'
import { getImporterNames, importRaw, ImportResult } from 'src/utils/importer'
import { buildOrderingIndex } from 'src/utils/ordering-index'

import { MonacoEditor } from '../collection-editor/MonacoEditor'
import { useActiveBranch } from '../dashboard/ProjectOverview'
import { FileDropzone } from '../utils/FileDropzone'
import { KeyValueResultsTable } from '../utils/KeyValueResultsTable'
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

type ImportDialogProps = {
  selectedProject: Y.Map<any>
}

export const ImportDialog = ({ selectedProject }: ImportDialogProps) => {
  const theme = useTheme()

  const { isOpen, project } = useReactiveVar(importDialogStateVar)
  const [activeTab, setActiveTab] = useState(0)
  const [activeSubtab, setActiveSubtab] = useState(0)
  const [rawText, setRawText] = useState('')
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const [importResult, setImportResult] = useState<ImportResult>(null)

  const branch = useActiveBranch()

  const handleClose = () => {
    importDialogStateVar({ isOpen: false, project: null })
    handleSubtabChange(0)
    setActiveTab(0)
  }

  const handleSubtabChange = (newTab: number) => {
    setRawText('')
    setActiveSubtab(newTab)
  }

  const handleImport = async () => {
    if (!scopeId) throw new Error('No scopeId')
    if (!rawBearer) throw new Error('No rawBearer')

    const importResult = await importRaw({
      rawText,
      scopeId,
      rawBearer,
    })

    setRawText('')
    setActiveSubtab(0)

    if (importResult) {
      const { collectionId, collection } = importResult.collection
      branch?.get('collections')?.set(collectionId, collection)

      buildOrderingIndex(collection, collection)

      if (importResult.environment) {
        const { environmentId, environment } = importResult.environment
        console.log('environmentId', environmentId, environment)
        branch?.get('environments')?.set(environmentId, environment)
      }
    }

    setImportResult(importResult)
    setActiveTab(1)
  }

  const formattedKeyValueResults = useMemo(() => {
    if (!importResult) return null

    const results = [] as { key: string; value: string }[]

    results.push({
      key: 'Import Type',
      value: importResult.importerName,
    })

    results.push({
      key: 'Collection',
      value: importResult.collection.collection.get('name'),
    })

    // Add restRequestsCount
    results.push({
      key: 'Rest Requests',
      value: importResult.restRequestsCount.toString(),
    })

    results.push({
      key: 'Folders',
      value: importResult.foldersCount.toString(),
    })

    if (importResult.environment) {
      results.push({
        key: 'Environment',
        value: importResult.environment.environment.get('name'),
      })

      results.push({
        key: 'Environment Variables',
        value: importResult.environment.variablesCount.toString(),
      })
    }

    return results
  }, [importResult])

  return (
    <Dialog
      open={isOpen && selectedProject.get('id') === project?.id}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
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
          {activeTab === 0 && (
            <>
              <SecondaryChips
                names={['Raw Text', 'File']}
                value={activeSubtab}
                onChange={handleSubtabChange}
              />
              {activeSubtab === 0 && (
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
                      ...getImporterNames().map((name) => ` - ${name}`),
                    ]}
                  />
                </Card>
              )}
              {activeSubtab === 1 && (
                <FileDropzone
                  primaryText="Drop file here"
                  secondaryMessages={['Or click to browse']}
                  onFiles={(files) => {
                    // Set raw tet file 0 contents
                    const reader = new FileReader()
                    reader.readAsText(files[0])
                    reader.onload = (e) => {
                      if (e.target?.result) {
                        setRawText(e.target.result as string)
                      }
                    }
                  }}
                >
                  <Box width="100%" display="flex" justifyContent="center">
                    <Grid
                      container
                      justifyContent="center"
                      maxWidth="50%"
                      sx={{
                        p: 0,
                        m: 0,
                      }}
                    >
                      {getImporterNames().map((name, index) => (
                        <Chip
                          label={name}
                          variant="outlined"
                          size="small"
                          key={index}
                          sx={{
                            m: 0.5,
                          }}
                        />
                      ))}
                    </Grid>
                  </Box>
                </FileDropzone>
              )}
            </>
          )}
          {activeTab === 1 &&
            (importResult && formattedKeyValueResults ? (
              <>
                <Typography variant="body1">Imported successfully</Typography>
                <KeyValueResultsTable values={formattedKeyValueResults} />
              </>
            ) : (
              <>
                <Typography variant="body1">Import failed</Typography>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    No valid import found, valid formats are:
                  </Typography>
                  <Grid container>
                    {getImporterNames().map((name, index) => (
                      <Grid item xs={6} key={index}>
                        <Typography
                          variant="body2"
                          sx={{
                            display: 'list-item',
                            listStylePosition: 'inside',
                          }}
                        >
                          {name}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </>
            ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        {activeTab === 0 && (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleImport}
              disabled={rawText.length === 0}
              variant="contained"
            >
              Continue
            </Button>
          </>
        )}
        {activeTab === 1 && (
          <>
            {!importResult && (
              <Button onClick={() => setActiveTab(0)}>Back</Button>
            )}
            <Button onClick={handleClose}>Close</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
