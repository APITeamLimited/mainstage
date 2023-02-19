import { Graph, MetricsCombination, GlobeTestMessage } from '@apiteam/types'
import { Box, Typography, useTheme } from '@mui/material'

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
}: MaximisedGraphDialogProps) => {
  const theme = useTheme()

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      title={graph.name}
      shrinkable
      scrollHeight={700}
      padBody
    >
      <BaseGraph
        graph={graph}
        metrics={metrics ?? []}
        height={customDialogContentHeight}
      />
      {graph.description && (
        <Typography
          variant="caption"
          color={theme.palette.text.secondary}
          sx={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          }}
          style={{
            marginTop: theme.spacing(-2),
          }}
        >
          {graph.description}
        </Typography>
      )}
    </CustomDialog>
  )
}
