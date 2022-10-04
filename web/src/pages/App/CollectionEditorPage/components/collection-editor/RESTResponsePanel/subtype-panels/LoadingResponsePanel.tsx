/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import type { Doc as YDoc, Map as YMap } from 'yjs'
import { useYMap } from 'src/lib/zustand-yjs'

import { BaseJob, jobQueueVar } from 'src/globe-test/lib'

import { PanelLayout } from '../../PanelLayout'
import { UnderlyingRequestPanel } from '../UnderlyingRequestPanel'

type LoadingResponsePanelProps = {
  focusedResponse: YMap<any>
}

export const LoadingResponsePanel = ({
  focusedResponse,
}: LoadingResponsePanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  const responseHook = useYMap(focusedResponse)

  return (
    <PanelLayout
      tabNames={['']}
      activeTabIndex={activeTabIndex}
      setActiveTabIndex={setActiveTabIndex}
      actionArea={actionArea}
    ></PanelLayout>
  )
}
