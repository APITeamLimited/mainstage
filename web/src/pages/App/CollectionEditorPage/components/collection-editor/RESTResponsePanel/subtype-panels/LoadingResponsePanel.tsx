/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { BaseJob, jobQueueVar } from 'src/globe-test/lib'

import { PanelLayout } from '../../PanelLayout'
import { UnderlyingRequestPanel } from '../UnderlyingRequestPanel'

type LoadingResponsePanelProps = {
  requestYMap: Y.Map<any>
}

export const LoadingResponsePanel = ({
  requestYMap,
}: LoadingResponsePanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)
  const jobQueue = useReactiveVar(jobQueueVar)
  const requestYMapHook = useYMap(requestYMap)

  return (
    <PanelLayout
      tabNames={['']}
      activeTabIndex={activeTabIndex}
      setActiveTabIndex={setActiveTabIndex}
      actionArea={actionArea}
    ></PanelLayout>
  )
}
