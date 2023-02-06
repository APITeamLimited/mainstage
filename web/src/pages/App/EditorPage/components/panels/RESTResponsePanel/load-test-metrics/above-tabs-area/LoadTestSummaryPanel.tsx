/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MetricsCombination, GlobeTestMessage } from '@apiteam/types/src'
import type { Map as YMap } from 'yjs'

import { StatsSkeleton } from '../../../components/stats'

import { MetricsOverviewStats } from './MetricsOverviewStats'

type LoadTestSummaryPanelProps = {
  metrics: (GlobeTestMessage & MetricsCombination)[] | null
  responseYMap: YMap<any>
  wasLimited?: boolean
  logsThrottled?: boolean
  errorMessage: string | null
}

export const LoadTestSummaryPanel = ({
  metrics,
  responseYMap,
  wasLimited,
  logsThrottled,
  errorMessage,
}: LoadTestSummaryPanelProps) => {
  return (
    <div key={responseYMap.get('id')}>
      {responseYMap.get('configuredGraphs') === true ? (
        <MetricsOverviewStats
          metrics={
            (metrics ?? []) as unknown as (GlobeTestMessage &
              MetricsCombination)[]
          }
          wasLimited={wasLimited}
          logsThrottled={logsThrottled}
          errorMessage={errorMessage}
        />
      ) : (
        <StatsSkeleton count={4} />
      )}
    </div>
  )
}
