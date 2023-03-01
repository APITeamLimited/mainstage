/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MetricsCombination, GlobeTestMessage } from '@apiteam/types'
import type { Map as YMap } from 'yjs'

import { StatsSkeleton } from '../../../../components/stats'

import { MetricsOverviewStats } from './MetricsOverviewStats'

type LoadTestSummaryPanelProps = {
  metrics: (GlobeTestMessage & MetricsCombination)[] | null
  responseYMap: YMap<any>
  unverifiedDomainThrottled?: boolean
  consoleLogsLimited?: boolean
  outputsLimited?: boolean
  errorMessage: string | null
}

export const LoadTestSummaryPanel = ({
  metrics,
  responseYMap,
  unverifiedDomainThrottled,
  consoleLogsLimited,
  outputsLimited,
  errorMessage,
}: LoadTestSummaryPanelProps) => {
  return (
    <div key={responseYMap.get('id')}>
      {responseYMap.get('configuredGraphs') === true ? (
        <>
          {metrics && metrics.length > 0 ? (
            <MetricsOverviewStats
              metrics={
                metrics as unknown as (GlobeTestMessage & MetricsCombination)[]
              }
              unverifiedDomainThrottled={unverifiedDomainThrottled}
              consoleLogsLimited={consoleLogsLimited}
              outputsLimited={outputsLimited}
              errorMessage={errorMessage}
            />
          ) : (
            <></>
          )}
        </>
      ) : (
        <StatsSkeleton count={4} />
      )}
    </div>
  )
}
