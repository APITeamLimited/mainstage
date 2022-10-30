import { BUILT_IN_METRICS } from './globe-test'

export type GraphSeries = {
  color: string
  kind: 'line' | 'area' | 'column'
  metric: typeof BUILT_IN_METRICS[number]
  name: string
}

export type Graph = {
  __typename: 'Graph'
  id: string
  name: string
  description?: string
  series: GraphSeries[]
  desiredWidth: 1 | 2 | 3
  shownZone?: string
}
