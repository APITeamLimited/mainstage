/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'

import { LOCAL_AGENT_MAX_JOBS } from '@apiteam/types'

import { LocalAgentIcon } from 'src/components/utils/Icons'
import { useLocalTestManager } from 'src/test-manager/executors/local-test-manager/LocalTestManagerProvider'

import { StatusBarItem } from '../StatusBarItem'

import { RunningLocalTestsDialog } from './RunningLocalTestsDialog'

export const RunningLocalTestsIndicator = () => {
  const localManager = useLocalTestManager()
  const [dialogOpen, setDialogOpen] = useState(false)

  const connectedCount = useMemo(
    () => (localManager === null ? null : localManager.runningTests.length),
    [localManager]
  )

  return (
    <>
      <StatusBarItem
        iconNode={<LocalAgentIcon connected={connectedCount !== null} />}
        tooltip="Local tests"
        text={
          connectedCount === null
            ? 'Localhost Agent Offline'
            : `${connectedCount}/${LOCAL_AGENT_MAX_JOBS} Running Local Tests`
        }
        onClick={() => setDialogOpen(true)}
      />
      <RunningLocalTestsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  )
}
