/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

import type { MetricsCombination, GlobeTestMessage } from '@apiteam/types/src'
import type { Map as YMap } from 'yjs'

import { useYMap } from 'src/lib/zustand-yjs'

import { MetricsOverviewStats } from './MetricsOverviewStats'
import { MetricsOverviewStatsSkeleton } from './MetricsOverviewStatsSkeleton'

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
        <MetricsOverviewStatsSkeleton />
      )}
    </div>
  )
}
