import { useEffect, useMemo, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types'

import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'

import { GlobeTestLogsPanel } from './GlobeTestLogsPanel'
import { ScriptPanel } from './ScriptPanel'

type ExecutionPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  globeTestLogs: GlobeTestMessage[]
  metrics?: GlobeTestMessage[]
  source: string
  sourceName: string
}

export const ExecutionPanel = ({
  setActionArea,
  globeTestLogs,
  metrics,
  source,
  sourceName,
}: ExecutionPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const tabNames = useMemo(() => {
    const tabNames = ['Script', 'Logs']
    if (metrics !== undefined) {
      tabNames.push('Metrics')
      tabNames.push('Metrics (Logs)')
    }
    return tabNames
  }, [metrics])

  useEffect(() => {
    if (!metrics && activeTabIndex > 1) {
      setActiveTabIndex(0)
    }
  }, [metrics, activeTabIndex])

  return (
    <>
      <SecondaryChips
        names={tabNames}
        value={activeTabIndex}
        onChange={setActiveTabIndex}
      />
      {activeTabIndex === 0 && (
        <ScriptPanel
          setActionArea={setActionArea}
          source={source}
          sourceName={sourceName}
        />
      )}
      {activeTabIndex === 1 && (
        <GlobeTestLogsPanel
          setActionArea={setActionArea}
          globeTestLogs={globeTestLogs}
        />
      )}
      {activeTabIndex === 3 && metrics !== undefined && (
        <GlobeTestLogsPanel
          setActionArea={setActionArea}
          globeTestLogs={metrics}
          disableFilterOptions
        />
      )}
    </>
  )
}
