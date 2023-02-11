/* eslint-disable @typescript-eslint/no-explicit-any */
import { Graph, GlobeTestOptions } from '@apiteam/types'
import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

export const configureGlobetestGraphs = async (
  responseYMap: Y.Map<any>,
  options: GlobeTestOptions
): Promise<void> => {
  if (!responseYMap) {
    console.warn('responseYMap is undefined')
    await new Promise((resolve) => setTimeout(resolve, 300))
    return configureGlobetestGraphs(responseYMap, options)
  }

  // Don't configure graphs if they already exist
  if (responseYMap.get('configuredGraphs') === true) {
    return
  }

  if (!options.outputConfig?.graphs) {
    responseYMap.set('configuredGraphs', true)
    return
  }

  // This pause is a really bad hack to make sure the graphsYMap is ready
  // TODO: Figure out why this is necessary
  await new Promise((resolve) => setTimeout(resolve, 4000))

  const graphsYMap = new Y.Map<Graph>()

  options.outputConfig?.graphs.forEach((graphConfig) => {
    const graph: Graph = {
      __typename: 'Graph',
      id: uuid(),
      name: graphConfig.name,
      description: graphConfig.description ?? undefined,
      series: graphConfig.series.map((seriesConfig) => ({
        loadZone: seriesConfig.loadZone,
        metric: seriesConfig.metric,
        kind: seriesConfig.kind,
        color: seriesConfig.color,
      })),
      desiredWidth: graphConfig.desiredWidth as 1 | 2 | 3,
    }

    graphsYMap.set(graph.id, graph)
  })

  // Force update by setting the graphs YMap again
  responseYMap.set('graphs', graphsYMap)
  responseYMap.set('configuredGraphs', true)
}
