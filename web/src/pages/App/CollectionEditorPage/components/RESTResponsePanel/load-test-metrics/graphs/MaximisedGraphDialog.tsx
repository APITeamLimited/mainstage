import { Graph, MetricsCombination, GlobeTestMessage } from '@apiteam/types/src'
import CloseIcon from '@mui/icons-material/Close'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material'

import { useSimplebarReactModule } from 'src/contexts/imports'

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
  const { default: SimpleBar } = useSimplebarReactModule()

  const theme = useTheme()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          width: '100%',
        }}
      >
        <DialogTitle>{graph.name}</DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            marginRight: 2,
          }}
        >
          <Tooltip title="Close">
            <IconButton
              onClick={onClose}
              sx={{
                color: theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Divider color={theme.palette.divider} />
      <DialogContent
        sx={{
          maxWidth: '100%',
          maxHeight: 'calc(100% - 1rem)',
          height: 500,
          padding: 1,
          overflow: 'hidden',
        }}
      >
        <SimpleBar style={{ height: '100%', maxHeight: '100%' }}>
          <BaseGraph graph={graph} metrics={metrics ?? []} height={480} />
        </SimpleBar>
      </DialogContent>
    </Dialog>
  )
}
