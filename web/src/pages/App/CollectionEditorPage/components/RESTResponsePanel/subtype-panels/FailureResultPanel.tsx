/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types/src'
import { Alert, Skeleton } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { GlobeTestIcon } from 'src/components/utils/GlobeTestIcon'
import { useYJSModule } from 'src/contexts/imports'
import { useRawBearer, useScopeId } from 'src/entity-engine/EntityEngine'
import { parseMessage } from 'src/globe-test/execution'
import { useYMap } from 'src/lib/zustand-yjs'
import { retrieveScopedResource } from 'src/store'

import { PanelLayout } from '../../PanelLayout'
import { ExecutionPanel } from '../ExecutionPanel'
import { FocusedRequestPanel } from '../FocusedRequestPanel/FocusedRequestPanel'

type FailureResultPanelProps = {
  focusedResponse: YMap<any>
}

export const FailureResultPanel = ({
  focusedResponse,
}: FailureResultPanelProps) => {
  const Y = useYJSModule()

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  const scopeId = useScopeId()
  const rawBearer = useRawBearer()

  const focusedResponseHook = useYMap(focusedResponse ?? new Y.Map())

  const [fetching, setFetching] = useState(false)

  const [storedGlobeTestLogs, setStoredGlobeTestLogs] = useState<
    GlobeTestMessage[] | null
  >(null)

  const updateData = async ({
    globeTestLogsStoreReceipt,
  }: {
    globeTestLogsStoreReceipt: string
  }) => {
    if (!scopeId || !rawBearer) {
      throw new Error('No scopeId or rawBearer')
    }

    const globeTestLogs = await retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: globeTestLogsStoreReceipt,
    })

    setStoredGlobeTestLogs(
      globeTestLogs.data.map((log: string) => parseMessage(log))
    )
  }

  useEffect(() => {
    if (fetching) {
      return
    }

    const globeTestLogsStoreReceipt =
      focusedResponse?.get('globeTestLogs')?.storeReceipt

    if (globeTestLogsStoreReceipt) {
      setStoredGlobeTestLogs(null)
      setFetching(true)

      updateData({
        globeTestLogsStoreReceipt,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedResponseHook])

  const errorMessage = useMemo(() => {
    if (!storedGlobeTestLogs) {
      return 'Request failed to execute, please examine the logs for more info.'
    }

    // Find last message with messageType ERROR and find most recent
    const sortedErrors = storedGlobeTestLogs
      .filter((message) => message.messageType === 'ERROR')
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    if (sortedErrors.length === 0) {
      return 'Request failed to execute, please examine the logs for more info.'
    }

    return sortedErrors[0].message as string
  }, [storedGlobeTestLogs])

  return (
    <PanelLayout
      tabNames={['Execution', 'Request']}
      tabIcons={[
        {
          name: 'Execution',
          icon: <GlobeTestIcon />,
        },
      ]}
      activeTabIndex={activeTabIndex}
      setActiveTabIndex={setActiveTabIndex}
      actionArea={actionArea}
      aboveTabsArea={<Alert severity="error">{errorMessage}</Alert>}
    >
      {activeTabIndex === 0 &&
        (storedGlobeTestLogs !== null ? (
          <ExecutionPanel
            setActionArea={setActionArea}
            globeTestLogs={storedGlobeTestLogs}
            source={focusedResponse.get('source')}
            sourceName={focusedResponse.get('sourceName')}
          />
        ) : (
          <Skeleton />
        ))}
      {activeTabIndex === 1 && (
        <FocusedRequestPanel
          request={focusedResponse.get('underlyingRequest')}
          finalEndpoint={focusedResponse.get('endpoint')}
          setActionArea={setActionArea}
        />
      )}
    </PanelLayout>
  )
}
