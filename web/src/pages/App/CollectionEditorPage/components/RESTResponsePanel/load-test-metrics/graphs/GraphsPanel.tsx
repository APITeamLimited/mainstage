/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react'

import type { GlobeTestMessage, MetricsCombination } from '@apiteam/types/src'
import { Grid, useMediaQuery } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { useSimplebarReactModule } from 'src/contexts/imports'

import { AddGraphButton } from './AddGraphButton'

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

  return (
    <SimpleBar style={{ maxHeight: '100%' }}>
      <Grid container spacing={2} sx={{ width: '100%' }}>
        <AddGraphButton
          onOpenMenu={function (): void {
            throw new Error('Function not implemented.')
          }}
        />
      </Grid>
    </SimpleBar>
  )
}
