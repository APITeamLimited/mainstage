/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from 'react'

import type {
  Graph,
  GlobeTestMessage,
  MetricsCombination,
} from '@apiteam/types'
import { Box, Grid, Skeleton } from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { useSimplebarReactModule, useYJSModule } from 'src/contexts/imports'
import { useYMap } from 'src/lib/zustand-yjs'

import { AddGraphButton } from './AddGraphButton'
import {
  EditGraphDialog,
  EditGraphDialogProps,
  defaultSeries,
} from './EditGraphDialog'
import { FramedGraph } from './FramedGraph'

type GraphsPanelProps = {
  focusedResponse: YMap<any>
  metrics:
    | (GlobeTestMessage & {
        orchestratorId: string
      } & MetricsCombination)[]
    | null
}

export const GraphsPanel = ({ focusedResponse, metrics }: GraphsPanelProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()
  const Y = useYJSModule()

  const dateSortedMetrics = useMemo(
    () =>
      metrics
        ? metrics.sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
          )
        : null,
    [metrics]
  )

  const getAndSetGraphYMap = () => {
    if (!focusedResponse.has('graphs')) {
      focusedResponse.set('graphs', new Y.Map<Graph>())
    }

    return focusedResponse.get('graphs') as YMap<Graph>
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const graphsYMap = useMemo(() => getAndSetGraphYMap(), [focusedResponse])
  const graphsHook = useYMap(graphsYMap)

  const handleSetGraph = (graph: Graph) => {
    const graphsYMap = getAndSetGraphYMap()
    graphsYMap.set(graph.id, graph)
  }

  const handleDeleteGraph = (graphId: string) => {
    const graphsYMap = getAndSetGraphYMap()
    graphsYMap.delete(graphId)
  }

  const [graphDialogState, setGraphDialogState] =
    useState<EditGraphDialogProps['existingGraph']>(null)

  const graphs = useMemo(() => {
    const graphsYMap = getAndSetGraphYMap()

    return Array.from(graphsYMap.values()) as Graph[]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphsHook])

  return (
    <>
      <EditGraphDialog
        onClose={() => setGraphDialogState(null)}
        existingGraph={graphDialogState}
        setGraph={handleSetGraph}
        metrics={dateSortedMetrics}
      />
      <Box
        sx={{
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
        }}
      >
        {focusedResponse.get('configuredGraphs') ? (
          <SimpleBar style={{ maxHeight: '100%' }}>
            <Grid container spacing={2} sx={{ width: '100%' }}>
              {graphs.map((graph) => (
                <FramedGraph
                  key={graph.id}
                  graph={graph}
                  metrics={dateSortedMetrics}
                  onDelete={() => handleDeleteGraph(graph.id)}
                  onEditDialog={() =>
                    setGraphDialogState({
                      graph,
                      open: true,
                      isNew: false,
                    })
                  }
                  updateGraph={handleSetGraph}
                />
              ))}
              <AddGraphButton
                onOpenCreateDialog={() =>
                  setGraphDialogState({
                    graph: {
                      __typename: 'Graph',
                      id: uuid(),
                      name: 'New Graph',
                      series: [defaultSeries],
                    },
                    open: true,
                    isNew: true,
                  })
                }
              />
            </Grid>
          </SimpleBar>
        ) : (
          <Skeleton height="100%" />
        )}
      </Box>
    </>
  )
}
