import { useState } from 'react'

import { DefaultMetrics, GlobeTestMessage } from '@apiteam/types'

import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'

import { GlobeTestLogsPanel } from './GlobeTestLogsPanel'
import { MetricsPanel } from './MetricsPanel'
import { ScriptPanel } from './ScriptPanel'

type ExecutionPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  globeTestLogs: GlobeTestMessage[]
  metrics: DefaultMetrics
}

export const ExecutionPanel = ({
  setActionArea,
  globeTestLogs,
  metrics,
}: ExecutionPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  return (
    <>
      <SecondaryChips
        names={['Script', 'Logs', 'Metrics']}
        value={activeTabIndex}
        onChange={setActiveTabIndex}
      />
      {activeTabIndex === 0 && (
        <ScriptPanel
          setActionArea={setActionArea}
          globeTestLogs={globeTestLogs}
        />
      )}
      {activeTabIndex === 1 && (
        <GlobeTestLogsPanel
          setActionArea={setActionArea}
          globeTestLogs={globeTestLogs}
        />
      )}
      {activeTabIndex === 2 && (
        <MetricsPanel setActionArea={setActionArea} metrics={metrics} />
      )}
    </>
  )
}
