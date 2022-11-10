import { BUILT_IN_METRICS } from './test-manager'

export const AVAILABLE_LOAD_ZONES = ['global', 'uk-portsmouth'] as const

export type GraphSeries = {
  loadZone: typeof AVAILABLE_LOAD_ZONES[number]
  color: string
  kind: 'line' | 'area' | 'column'
  metric: typeof BUILT_IN_METRICS[number]
}

export type Graph = {
  __typename: 'Graph'
  id: string
  name: string
  description?: string
  series: GraphSeries[]
  desiredWidth: 1 | 2 | 3
}
