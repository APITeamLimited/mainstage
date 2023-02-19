/* eslint-disable @typescript-eslint/no-explicit-any */

import type { MetricsCombination, GlobeTestMessage } from '@apiteam/types'
import type { Map as YMap } from 'yjs'

import { StatsSkeleton } from '../../../components/stats'

import { MetricsOverviewStats } from './MetricsOverviewStats'

type LoadTestSummaryPanelProps = {
  metrics: (GlobeTestMessage & MetricsCombination)[] | null
  responseYMap: YMap<any>
  wasLimited?: boolean
  logsThrottled?: boolean
  outputsThrottled?: boolean
  errorMessage: string | null
}

export const LoadTestSummaryPanel = ({
  metrics,
  responseYMap,
  wasLimited,
  logsThrottled,
  outputsThrottled,
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
              wasLimited={wasLimited}
              logsThrottled={logsThrottled}
              outputsThrottled={outputsThrottled}
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
