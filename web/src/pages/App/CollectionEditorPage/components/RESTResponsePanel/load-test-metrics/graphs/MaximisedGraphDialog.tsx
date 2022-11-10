import { Graph, MetricsCombination, GlobeTestMessage } from '@apiteam/types/src'
import { Box, Typography } from '@mui/material'

import {
  CustomDialog,
  customDialogContentHeight,
} from 'src/components/custom-mui'

import { BaseGraph } from './BaseGraph'

type MaximisedGraphDialogProps = {
  open: boolean
  onClose: () => void
  graph: Graph
  metrics:
    | (GlobeTestMessage & {
        orchestratorId: string
      } & MetricsCombination)[]
    | null
}

export const MaximisedGraphDialog = ({
  open,
  onClose,
  graph,
  metrics,
}: MaximisedGraphDialogProps) => (
  <CustomDialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="xl"
    title={graph.name}
  >
    <Box
      sx={{
        height: `${customDialogContentHeight}`,
      }}
    >
      <BaseGraph
        graph={graph}
        metrics={metrics ?? []}
        height={customDialogContentHeight - (graph.description ? 20 : 0)}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          px: 2,
          pb: 2,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        {graph.description}
      </Typography>
    </Box>
  </CustomDialog>
)
