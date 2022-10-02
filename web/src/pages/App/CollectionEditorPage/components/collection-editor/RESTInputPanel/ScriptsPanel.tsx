import { useEffect, useMemo, useRef, useState } from 'react'

import { ExecutionScript } from '@apiteam/types/src'
import {
  Stack,
  Typography,
  Box,
  useTheme,
  MenuItem,
  MenuList,
} from '@mui/material'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { codeFormatter } from 'src/utils/codeFormatter'
import { BUILTIN_REST_SCRIPTS } from 'src/utils/rest-scripts'

import { QuickActionArea } from '../../../../../../components/app/utils/QuickActionArea'
import { RequestListItem } from '../../../../../../components/app/utils/RequestListItem'

type ScriptsPanelProps = {
  executionScripts: ExecutionScript[]
  setExecutionScripts: (executionScripts: ExecutionScript[]) => void
  setActionArea: (actionArea: React.ReactNode) => void
  namespace: string
}

export const ScriptsPanel = ({
  executionScripts,
  setExecutionScripts,
  setActionArea,
  namespace,
}: ScriptsPanelProps) => {
  const theme = useTheme()

  const [activeScriptIndex, setActiveScriptIndex] = useState(0)

  const scripts = useMemo(() => {
    return [...BUILTIN_REST_SCRIPTS, ...executionScripts]
  }, [executionScripts])

  const valueRef = useRef<string>(scripts[activeScriptIndex].script)
  valueRef.current = scripts[activeScriptIndex].script

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
    setActionArea(
      <QuickActionArea
        onDeleteCallback={
          scripts[activeScriptIndex].builtIn ? undefined : handleBodyDelete
        }
        prettyPrintCallback={
          scripts[activeScriptIndex].builtIn ? undefined : handlePrettyPrint
        }
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScriptIndex])

  return (
    <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
      <MonacoEditor
        value={scripts[activeScriptIndex].script}
        onChange={(script) => {
          const newExecutionScripts = [...scripts]
          newExecutionScripts[activeScriptIndex].script = script
          handleSetExecutionScripts(newExecutionScripts)
        }}
        language="javascript"
        namespace={`${namespace}-${activeScriptIndex}`}
        placeholder={['const { request, response } = context']}
        readOnly={scripts[activeScriptIndex].builtIn}
      />
      <Stack spacing={2} sx={{ height: '100%', overflow: 'auto' }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Scripts
          </Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            Scripts can be used to customise request execution
          </Typography>
        </Box>
        <Box>
          {scripts.map((executionScript, index) => (
            <MenuItem key={index} onClick={() => setActiveScriptIndex(index)}>
              <Typography
                fontWeight={index === activeScriptIndex ? 'bold' : 'normal'}
              >
                {executionScript.name}
              </Typography>
            </MenuItem>
          ))}
        </Box>
        <MenuItem
          onClick={() => {
            const newExecutionScripts = [...scripts]
            newExecutionScripts.push({
              name: 'New Script',
              script: '',
              builtIn: false,
              language: 'javascript',
            })
            handleSetExecutionScripts(newExecutionScripts)
            setActiveScriptIndex(newExecutionScripts.length - 1)
          }}
        >
          <Typography>Add Script</Typography>
        </MenuItem>
      </Stack>
    </Stack>
  )
}
