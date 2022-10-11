import { useEffect, useMemo, useRef, useState } from 'react'

import { ExecutionScript } from '@apiteam/types/src'
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
import { codeFormatter } from 'src/utils/codeFormatter'
import { BUILTIN_REST_SCRIPTS } from 'src/utils/rest-scripts'

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
  const theme = useTheme()

  const [activeScriptIndex, setActiveScriptIndex] = useState(0)

  const scripts = useMemo(() => {
    return [...BUILTIN_REST_SCRIPTS, ...executionScripts]
  }, [executionScripts])

  const valueRef = useRef<string>(scripts[activeScriptIndex].script)
  valueRef.current = scripts[activeScriptIndex].script

  const scriptsRef = useRef<ExecutionScript[]>(executionScripts)
  scriptsRef.current = executionScripts

  const handleBodyDelete = () => {
    // Set active executtion script to empty string
    const newScripts = [...scripts]
    newScripts[activeScriptIndex].script = ''
    handleSetExecutionScripts(newScripts)
  }

  const handlePrettyPrint = async () => {
    const newScript = await codeFormatter(
      valueRef.current,
      scripts[activeScriptIndex].language
    )

    const newScripts = [...scripts]
    newScripts[activeScriptIndex].script = newScript
    handleSetExecutionScripts(newScripts)
  }

  const handleSetExecutionScripts = (
    newExecutionScripts: ExecutionScript[]
  ) => {
    // Ensure no built-in scripts are set
    setExecutionScripts(newExecutionScripts.filter((script) => !script.builtIn))
  }

  useEffect(() => {
    const onDeleteCallback = scripts[activeScriptIndex].builtIn
      ? undefined
      : handleBodyDelete
    const prettyPrintCallback = scripts[activeScriptIndex].builtIn
      ? undefined
      : handlePrettyPrint

    const executeButton = (
      <Button
        onClick={() => onExecute(scripts[activeScriptIndex])}
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
      (scripts.findIndex(
        (executionScript) =>
          executionScript.script === showQueryDeleteDialog?.script &&
          executionScript.language === showQueryDeleteDialog?.language &&
          executionScript.name === showQueryDeleteDialog?.name
      ) ?? 1) - 1

    const newScripts = scripts.filter(
      (script) => script.name !== showQueryDeleteDialog?.name
    )
    handleSetExecutionScripts(newScripts)
    setActiveScriptIndex(newIndex)
  }

  const [showCreateScriptDialog, setShowCreateScriptDialog] = useState(false)

  const handleScriptCreate = (scriptName: string) => {
    const newExecutionScripts = [...scripts]
    newExecutionScripts.push({
      name: scriptName,
      script: '',
      builtIn: false,
      language: 'javascript',
    })
    handleSetExecutionScripts(newExecutionScripts)
    setActiveScriptIndex(newExecutionScripts.length - 1)
  }

  const [sourceKey] = useState(() => Math.random().toString())

  return (
    <>
      <CreateScriptDialog
        isOpen={showCreateScriptDialog}
        onClose={() => setShowCreateScriptDialog(false)}
        onCreate={handleScriptCreate}
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
          value={scripts[activeScriptIndex].script}
          onChange={(script) => {
            const newExecutionScripts = [...scriptsRef.current]
            newExecutionScripts[activeScriptIndex].script = script
            handleSetExecutionScripts(newExecutionScripts)
          }}
          language={scripts[activeScriptIndex].language}
          namespace={`${namespace}${sourceKey}${scripts[activeScriptIndex].name}-${activeScriptIndex}`}
          placeholder={[
            'Start typing to create your new script',
            '',
            'Alternatively, check out some of the built-in scripts as a starting point',
          ]}
          readOnly={scripts[activeScriptIndex].builtIn}
        />
        <Stack
          spacing={2}
          sx={{ height: '100%', overflow: 'auto', width: '16rem' }}
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
          {scripts.map((executionScript, index) => (
            <Stack
              key={index}
              direction="row"
              spacing={1}
              sx={{ width: '100%' }}
              alignItems="center"
              justifyContent="space-between"
            >
              <DescriptionTooltipWrapper executionScript={executionScript}>
                <Button
                  onClick={() => setActiveScriptIndex(index)}
                  size="small"
                  variant={index === activeScriptIndex ? 'contained' : 'text'}
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
