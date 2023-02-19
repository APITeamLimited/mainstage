import { useEffect, useMemo, useState } from 'react'

import { ExecutionScript } from '@apiteam/types'
import ClearIcon from '@mui/icons-material/Clear'
import {
  Stack,
  Typography,
  Box,
  useTheme,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'

import { QueryDeleteDialog } from 'src/components/app/dialogs/QueryDeleteDialog'
import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { QuickActionArea } from 'src/components/app/utils/QuickActionArea'
import { useSimplebarReactModule } from 'src/contexts/imports'
import { codeFormatter } from 'src/utils/codeFormatter'

import { CreateScriptDialog } from './CreateScriptDialog'

type ScriptsPanelProps = {
  executionScripts: ExecutionScript[]
  setExecutionScripts: (executionScripts: ExecutionScript[]) => void
  setActionArea: (actionArea: React.ReactNode) => void
  namespace: string
  onExecute: (executionScript: ExecutionScript) => void
}

export const ScriptsPanel = ({
  executionScripts,
  setExecutionScripts,
  setActionArea,
  namespace,
  onExecute,
}: ScriptsPanelProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  const theme = useTheme()

  const [activeScriptIndex, setActiveScriptIndex] = useState(0)

  const handleBodyDelete = () => {
    // Set active executtion script to empty string
    const newScripts = [...executionScripts]
    newScripts[activeScriptIndex].script = ''
    setExecutionScripts(newScripts)
  }

  const handlePrettyPrint = async () => {
    const newScript = await codeFormatter(
      executionScripts[activeScriptIndex].script,
      executionScripts[activeScriptIndex].language
    )

    const newScripts = [...executionScripts]
    newScripts[activeScriptIndex].script = newScript
    setExecutionScripts(newScripts)
  }

  useEffect(() => {
    const onDeleteCallback = executionScripts[activeScriptIndex].builtIn
      ? undefined
      : handleBodyDelete
    const prettyPrintCallback = executionScripts[activeScriptIndex].builtIn
      ? undefined
      : handlePrettyPrint

    const executeButton = (
      <Button
        onClick={() => onExecute(executionScripts[activeScriptIndex])}
        size="small"
        variant="outlined"
        sx={{
          marginRight: onDeleteCallback || prettyPrintCallback ? 1 : 0,
        }}
      >
        Execute
      </Button>
    )

    setActionArea(
      <QuickActionArea
        onDeleteCallback={onDeleteCallback}
        prettyPrintCallback={prettyPrintCallback}
        customActions={[executeButton]}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScriptIndex])

  const [showQueryDeleteDialog, setShowQueryDeleteDialog] =
    useState<null | ExecutionScript>(null)

  const handleScriptDelete = () => {
    const newIndex =
      (executionScripts.findIndex(
        (executionScript) =>
          executionScript.script === showQueryDeleteDialog?.script &&
          executionScript.language === showQueryDeleteDialog?.language &&
          executionScript.name === showQueryDeleteDialog?.name
      ) ?? 1) - 1

    const newScripts = executionScripts.filter(
      (script) => script.name !== showQueryDeleteDialog?.name
    )
    setExecutionScripts(newScripts)
    setActiveScriptIndex(newIndex)
  }

  const [showCreateScriptDialog, setShowCreateScriptDialog] = useState(false)

  const handleScriptCreate = (scriptName: string) => {
    const newExecutionScripts = [...executionScripts]
    newExecutionScripts.push({
      name: scriptName,
      script: '',
      builtIn: false,
      language: 'javascript',
    })
    setExecutionScripts(newExecutionScripts)
    setActiveScriptIndex(newExecutionScripts.length - 1)
  }

  const existingScriptNames = useMemo(
    () => executionScripts.map((script) => script.name),
    [executionScripts]
  )

  // In case remote clients delete the active script
  if (activeScriptIndex === undefined) {
    setActiveScriptIndex(0)
    return <></>
  }

  return (
    <>
      <CreateScriptDialog
        isOpen={showCreateScriptDialog}
        onClose={() => setShowCreateScriptDialog(false)}
        onCreate={handleScriptCreate}
        existingScriptNames={existingScriptNames}
      />
      <QueryDeleteDialog
        show={!!showQueryDeleteDialog}
        onDelete={handleScriptDelete}
        onClose={() => setShowQueryDeleteDialog(null)}
        title="Delete Script"
        description={`Are you sure you want to delete the script "${showQueryDeleteDialog?.name}"?`}
      />
      <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
        <MonacoEditor
          value={executionScripts[activeScriptIndex].script}
          onChange={(script) => {
            const newExecutionScripts = [...executionScripts]
            newExecutionScripts[activeScriptIndex].script = script
            setExecutionScripts(newExecutionScripts)
          }}
          language={executionScripts[activeScriptIndex].language}
          namespace={`${namespace}${executionScripts[activeScriptIndex].name}-${activeScriptIndex}`}
          placeholder={[
            'Start typing to create your new script',
            '',
            'Alternatively, check out some of the built-in execution scripts as a starting point',
          ]}
          readOnly={executionScripts[activeScriptIndex].builtIn}
        />
        <Stack
          spacing={2}
          sx={{
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            width: '16rem',
          }}
        >
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                userSelect: 'none',
              }}
            >
              Scripts
            </Typography>
            <Typography
              variant="caption"
              color={theme.palette.text.secondary}
              sx={{
                userSelect: 'none',
              }}
            >
              Scripts can be used to customise request execution
            </Typography>
          </Box>
          <Box
            sx={{
              overflow: 'hidden',
              height: '100%',
              maxHeight: '100%',
            }}
          >
            <SimpleBar style={{ maxHeight: '100%' }}>
              <Stack spacing={2} sx={{ height: '100%', overflow: 'visible' }}>
                {executionScripts.map((executionScript, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1}
                    sx={{ width: '100%' }}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <DescriptionTooltipWrapper
                      executionScript={executionScript}
                    >
                      <Button
                        onClick={() => setActiveScriptIndex(index)}
                        size="small"
                        variant={
                          index === activeScriptIndex ? 'contained' : 'text'
                        }
                        fullWidth
                      >
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {executionScript.name}
                        </span>
                      </Button>
                    </DescriptionTooltipWrapper>
                    <IconButton
                      onClick={() => setShowQueryDeleteDialog(executionScript)}
                      size="small"
                      disabled={executionScript.builtIn}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Divider />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowCreateScriptDialog(true)}
                  color="secondary"
                >
                  New Script
                </Button>
              </Stack>
            </SimpleBar>
          </Box>
        </Stack>
      </Stack>
    </>
  )
}

const DescriptionTooltipWrapper = ({
  executionScript,
  children,
}: {
  executionScript: ExecutionScript
  children?: React.ReactElement
}) => {
  if (!children) {
    return <></>
  }

  if (!executionScript.builtIn || !executionScript.description) {
    return children
  }

  return (
    <Tooltip title={executionScript.description} placement="left">
      {children}
    </Tooltip>
  )
}
