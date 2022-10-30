/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MetricsCombination, GlobeTestMessage } from '@apiteam/types/src'
import type { Map as YMap } from 'yjs'

import { StatsSkeleton } from '../../../stats'

import { MetricsOverviewStats } from './MetricsOverviewStats'

type LoadTestSummaryPanelProps = {
  metrics: (GlobeTestMessage & MetricsCombination)[] | null
  responseYMap: YMap<any>
}

export const LoadTestSummaryPanel = ({
  metrics,
  responseYMap,
}: LoadTestSummaryPanelProps) => {
  return (
    <div key={responseYMap.get('id')}>
      {metrics ? (
        <MetricsOverviewStats
          metrics={
            (metrics ?? []) as unknown as (GlobeTestMessage &
              MetricsCombination)[]
          }
        />
      ) : (
        <StatsSkeleton count={4} />
      )}
    </div>
  )
}
