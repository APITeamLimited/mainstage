/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MetricsCombination, GlobeTestMessage } from '@apiteam/types/src'
import type { Map as YMap } from 'yjs'

import { StatsSkeleton } from '../../../stats'

import { MetricsOverviewStats } from './MetricsOverviewStats'

type LoadTestSummaryPanelProps = {
  metrics: (GlobeTestMessage & MetricsCombination)[] | null
  responseYMap: YMap<any>
  wasLimited?: boolean
}

export const LoadTestSummaryPanel = ({
  metrics,
  responseYMap,
  wasLimited,
}: LoadTestSummaryPanelProps) => {
  return (
    <div key={responseYMap.get('id')}>
      {metrics ? (
        <MetricsOverviewStats
          metrics={
            (metrics ?? []) as unknown as (GlobeTestMessage &
              MetricsCombination)[]
          }
          wasLimited={wasLimited}
        />
      ) : (
        <StatsSkeleton count={4} />
      )}
    </div>
  )
}
