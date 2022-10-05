/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'

import type { Map as YMap } from 'yjs'

import { SendingRequestAnimation } from 'src/components/app/utils/SendingRequestAnimation'
import { useYMap } from 'src/lib/zustand-yjs'

import { PanelLayout } from '../../../PanelLayout'
import { LiveExecutionPanel } from '../../ExecutionPanel/LiveExecutionPanel'
import { FocusedRequestPanel } from '../../FocusedRequestPanel/FocusedRequestPanel'

type LoadingResponsePanelProps = {
  focusedResponse: YMap<any>
}

export const LoadingResponsePanel = ({
  focusedResponse,
}: LoadingResponsePanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  useYMap(focusedResponse)

  useEffect(() => {
    return () => console.log('unmounting LoadingResponsePanel')
  }, [])

  return (
    <>
      <SendingRequestAnimation />
      <PanelLayout
        tabNames={['Execution', 'Request']}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
      >
        {activeTabIndex === 0 && (
          <LiveExecutionPanel
            focusedResponse={focusedResponse}
            setActionArea={setActionArea}
          />
        )}
        {activeTabIndex === 1 && (
          <FocusedRequestPanel
            request={focusedResponse.get('underlyingRequest')}
            finalEndpoint={focusedResponse.get('endpoint')}
            setActionArea={setActionArea}
          />
        )}
      </PanelLayout>
    </>
  )
}
