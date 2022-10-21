import { useEffect, useMemo, useState } from 'react'

import { GlobeTestMessage } from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart'
import { useTheme } from '@mui/material'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'
import { focusedResponseVar } from 'src/contexts/focused-response'
import { useHashSumModule } from 'src/contexts/imports'

import { MetricsList } from '../subtype-panels/SuccessSingleResultPanel'

import { GlobeTestLogsPanel } from './GlobeTestLogsPanel'
import { ScriptPanel } from './ScriptPanel'

type ExecutionPanelProps = {
  setActionArea: (actionArea: React.ReactNode) => void
  globeTestLogs: GlobeTestMessage[]
  metrics?: 'NONE' | MetricsList[] | null
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
  const { default: hash } = useHashSumModule()

  const theme = useTheme()

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

  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  const focusedResponseHash = useMemo(
    () => hash(focusedResponseDict),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseDict]
  )

  useEffect(() => {
    if (activeTabIndex === 2) {
      setActionArea(null)
    } else if (
      activeTabIndex === 3 &&
      (!metrics || metrics === 'NONE' || metrics.length === 0)
    ) {
      setActionArea(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabIndex, metrics])

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
          key={focusedResponseHash}
        />
      )}
      {activeTabIndex === 1 && (
        <GlobeTestLogsPanel
          setActionArea={setActionArea}
          globeTestLogs={globeTestLogs}
          key={focusedResponseHash}
        />
      )}
      {activeTabIndex === 2 && (
        <>
          {!metrics || metrics === 'NONE' || metrics.length === 0 ? (
            <EmptyPanelMessage
              primaryText="No metrics were found"
              icon={
                <StackedLineChartIcon
                  sx={{
                    marginBottom: 2,
                    width: 80,
                    height: 80,
                    color: theme.palette.action.disabled,
                  }}
                />
              }
            />
          ) : (
            <>Metrics</>
          )}
        </>
      )}
      {activeTabIndex === 3 && (
        <>
          {!metrics || metrics === 'NONE' || metrics.length === 0 ? (
            <EmptyPanelMessage
              primaryText="No metrics were found"
              icon={
                <StackedLineChartIcon
                  sx={{
                    marginBottom: 2,
                    width: 80,
                    height: 80,
                    color: theme.palette.action.disabled,
                  }}
                />
              }
            />
          ) : (
            <GlobeTestLogsPanel
              setActionArea={setActionArea}
              globeTestLogs={metrics as unknown as GlobeTestMessage[]}
              disableFilterOptions
              key={focusedResponseHash}
            />
          )}
        </>
      )}
    </>
  )
}
