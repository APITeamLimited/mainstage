/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types/src'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Button,
  Popover,
  FormControlLabel,
  Checkbox,
  useTheme,
} from '@mui/material'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { QuickActionArea } from 'src/components/app/utils/QuickActionArea'
import { codeFormatter } from 'src/utils/codeFormatter'

type GlobeTestLogsPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  globeTestLogs: GlobeTestMessage[]
  disableFilterOptions?: boolean
  namespace: string
}

export const GlobeTestLogsPanel = ({
  setActionArea,
  globeTestLogs,
  disableFilterOptions,
  namespace,
}: GlobeTestLogsPanelProps) => {
  const theme = useTheme()

  const orchestratorId = useMemo(() => {
    if (disableFilterOptions) {
      return null
    }

    const anyOrchestratorMessage = globeTestLogs.find(
      (log) => (log as any).orchestratorId !== undefined
    )

    if (!anyOrchestratorMessage) {
      return null
    }

    return (anyOrchestratorMessage as any).orchestratorId as string
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globeTestLogs])

  const workerIds = useMemo(() => {
    if (disableFilterOptions) {
      return []
    }

    const workerIds: string[] = []
    for (const globeTestLog of globeTestLogs) {
      // Check if workerId is in log

      if ((globeTestLog as any).workerId) {
        // Check if workerId is in workerIds
        if (!workerIds.includes((globeTestLog as any).workerId)) {
          workerIds.push((globeTestLog as any).workerId)
        }
      }
    }
    return workerIds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globeTestLogs])

  const [checkedOrchestratorId, setCheckedOrchestratorId] = useState(true)

  const [checkedWorkerIds, setCheckedWorkerIds] = useState(
    workerIds.reduce((acc, workerId) => {
      acc[workerId] = true
      return acc
    }, {} as Record<string, boolean>)
  )

  useEffect(() => {
    // If checked workerIds doesnt include worker id add it
    const newCheckedWorkerIds = { ...checkedWorkerIds }
    let updated = false

    for (const workerId of workerIds) {
      if (!newCheckedWorkerIds[workerId]) {
        newCheckedWorkerIds[workerId] = true
        updated = true
      }
    }

    if (updated) {
      setCheckedWorkerIds(newCheckedWorkerIds)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerIds])

  const [messageTypeShown, setMessageTypeShown] = useState(
    globeTestLogs.reduce((acc, globeTestLog) => {
      acc[globeTestLog.messageType] = true
      return acc
    }, {} as Record<string, boolean>)
  )

  const logs = useMemo(() => {
    let sortedAll = globeTestLogs.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    )

    // Check if including checkedOrchestratorId if orchestratorId is false,
    // Filter out
    if (!checkedOrchestratorId) {
      sortedAll = sortedAll.filter(
        (log) => (log as any).orchestratorId !== orchestratorId
      )
    }

    // Loop through workerIds
    for (const workerId of workerIds) {
      // Check if workerId is checked
      if (!checkedWorkerIds[workerId]) {
        // Filter out
        sortedAll = sortedAll.filter(
          (log) => (log as any).workerId !== workerId
        )
      }
    }

    // Loop through messageTypes
    for (const messageType of Object.keys(messageTypeShown)) {
      // Check if messageType is checked
      if (!messageTypeShown[messageType]) {
        // Filter out
        sortedAll = sortedAll.filter((log) => log.messageType !== messageType)
      }
    }

    return sortedAll
  }, [
    globeTestLogs,
    checkedOrchestratorId,
    orchestratorId,
    workerIds,
    checkedWorkerIds,
    messageTypeShown,
  ])

  const [openOptionsMenu, setOpenOptionsMenu] = useState(false)

  const [editorValue, setEditorValue] = useState<string | null>(null)

  useEffect(() => {
    const performAsync = async () => {
      setEditorValue(await codeFormatter(JSON.stringify(logs), 'json'))
    }
    performAsync()
  }, [logs])

  useEffect(() => {
    const customActions = []

    customActions.push(
      <Tooltip title="Copy All" key="Copy All">
        <IconButton
          onClick={() => navigator.clipboard.writeText(editorValue ?? '')}
        >
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    )

    setActionArea(<QuickActionArea customActions={customActions} />)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorValue])

  const optionsButtonRef = useRef<HTMLButtonElement>(null)

  if (editorValue === null) return <></>

  return (
    <Stack
      spacing={2}
      sx={{
        maxHeight: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {(orchestratorId ||
          workerIds.length > 0 ||
          Object.keys(messageTypeShown).length > 0) &&
          !disableFilterOptions && (
            <Button
              variant="outlined"
              onClick={() => setOpenOptionsMenu(!openOptionsMenu)}
              endIcon={
                openOptionsMenu ? (
                  <KeyboardArrowDownIcon />
                ) : (
                  <KeyboardArrowUpIcon />
                )
              }
              ref={optionsButtonRef}
              size="small"
            >
              Filter Messages
            </Button>
          )}
        <Typography variant="body1" fontWeight="bold">
          {logs.length}/{globeTestLogs.length} messages
        </Typography>
      </Stack>
      <Popover
        open={openOptionsMenu}
        anchorEl={optionsButtonRef.current}
        sx={{
          mt: 1,
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setOpenOptionsMenu(false)}
      >
        <Stack
          sx={{
            py: 1,
            paddingX: 2,
            backgroundColor: theme.palette.background.paper,
          }}
          spacing={1}
        >
          {orchestratorId !== null && (
            <Box>
              <Typography
                color={theme.palette.text.secondary}
                fontSize="0.8rem"
                gutterBottom
              >
                Orchestrator
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkedOrchestratorId}
                    onChange={(e) => setCheckedOrchestratorId(e.target.checked)}
                  />
                }
                label={
                  <span
                    style={{
                      userSelect: 'none',
                    }}
                  >
                    {orchestratorId}
                  </span>
                }
              />
            </Box>
          )}
          <Box>
            <Typography
              color={theme.palette.text.secondary}
              fontSize="0.8rem"
              gutterBottom
            >
              Workers
            </Typography>
            {workerIds.map((workerId) => (
              <FormControlLabel
                key={workerId}
                control={
                  <Checkbox
                    checked={checkedWorkerIds[workerId]}
                    onChange={(e) => {
                      setCheckedWorkerIds({
                        ...checkedWorkerIds,
                        [workerId]: e.target.checked,
                      })
                    }}
                  />
                }
                label={
                  <span
                    style={{
                      userSelect: 'none',
                    }}
                  >
                    {workerId}
                  </span>
                }
              />
            ))}
          </Box>
          <Box>
            <Typography
              color={theme.palette.text.secondary}
              fontSize="0.8rem"
              gutterBottom
            >
              Message Type
            </Typography>
            {Object.keys(messageTypeShown)
              .sort()
              .map((messageType) => (
                <FormControlLabel
                  key={messageType}
                  control={
                    <Checkbox
                      checked={messageTypeShown[messageType]}
                      onChange={(e) => {
                        setMessageTypeShown({
                          ...messageTypeShown,
                          [messageType]: e.target.checked,
                        })
                      }}
                    />
                  }
                  label={
                    <span
                      style={{
                        userSelect: 'none',
                      }}
                    >
                      {messageType}
                    </span>
                  }
                />
              ))}
          </Box>
        </Stack>
      </Popover>
      <MonacoEditor
        language="json"
        value={editorValue}
        readOnly={true}
        wordWrap="on"
        scrollBeyondLastLine={false}
        namespace={`globe-test-logs-${namespace}`}
      />
    </Stack>
  )
}
