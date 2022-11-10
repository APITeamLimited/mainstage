import { useRef, useState } from 'react'

import type {
  Graph,
  GlobeTestMessage,
  MetricsCombination,
} from '@apiteam/types/src'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import {
  Card,
  Grid,
  IconButton,
  Popover,
  MenuItem,
  Stack,
  ListItemText,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
} from '@mui/material'

import { BaseGraph } from './BaseGraph'
import { MaximisedGraphDialog } from './MaximisedGraphDialog'

import {
  GRAPH_SPACING_XS,
  GRAPH_SPACING_LG,
  GRAPH_SPACING_XL,
  GRAPH_HEIGHT,
} from '.'

type FramedGraphProps = {
  graph: Graph
  metrics:
    | (GlobeTestMessage & {
        orchestratorId: string
      } & MetricsCombination)[]
    | null
  onDelete: () => void
  onEditDialog: () => void
  updateGraph: (graph: Graph) => void
}

export const FramedGraph = ({
  graph,
  metrics,
  onDelete,
  onEditDialog,
  updateGraph,
}: FramedGraphProps) => {
  const optionsButtonRef = useRef<HTMLButtonElement | null>(null)
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false)
  const [maximisedDialogOpen, setMaximisedDialogOpen] = useState(false)

  return (
    <>
      <MaximisedGraphDialog
        open={maximisedDialogOpen}
        onClose={() => setMaximisedDialogOpen(false)}
        graph={graph}
        metrics={metrics}
      />
      <Popover
        anchorEl={optionsButtonRef.current}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        onClose={() => setOptionsMenuOpen(false)}
        open={optionsMenuOpen}
        sx={{
          mt: 1,
        }}
      >
        <MenuItem
          onClick={() => {
            setOptionsMenuOpen(false)
            onEditDialog()
          }}
        >
          <ListItemText primary="Edit Graph" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOptionsMenuOpen(false)
            onDelete()
          }}
        >
          <ListItemText primary="Delete Graph" />
        </MenuItem>
      </Popover>
      <Grid
        item
        xs={GRAPH_SPACING_XS}
        lg={(graph.desiredWidth ?? 0) >= 2 ? 12 : GRAPH_SPACING_LG}
        xl={
          (graph.desiredWidth ?? 0) === 3
            ? 12
            : (graph.desiredWidth ?? 0) === 2
            ? 8
            : GRAPH_SPACING_XL
        }
      >
        <Box
          sx={{
            width: '100%',
            maxHeight: GRAPH_HEIGHT,
            height: GRAPH_HEIGHT,
            overflow: 'hidden',
          }}
        >
          <Card
            sx={{
              maxHeight: 'calc(100% - 2px)',
              overflow: 'hidden',
              height: '100%',
            }}
            variant="outlined"
          >
            <Stack
              sx={{
                maxHeight: 'calc(100% - 2rem)',
                overflow: 'hidden',
                height: '100%',
              }}
              padding={2}
            >
              <Stack
                direction="row"
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {graph.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ToggleButtonGroup
                    value={graph.desiredWidth ?? 1}
                    exclusive
                    onChange={(_, newWidth: number) => {
                      if (typeof newWidth === 'number') {
                        updateGraph({
                          ...graph,
                          desiredWidth: newWidth as 1 | 2 | 3,
                        })
                      }
                    }}
                    aria-label="graph width"
                    size="small"
                    sx={{
                      // Looks better
                      mr: 2,
                    }}
                  >
                    <ToggleButton value={1} aria-label="1">
                      1X
                    </ToggleButton>
                    <ToggleButton value={2} aria-label="2">
                      2X
                    </ToggleButton>
                    <ToggleButton value={3} aria-label="3">
                      3X
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <IconButton
                    size="small"
                    ref={optionsButtonRef}
                    onClick={() => setMaximisedDialogOpen(true)}
                  >
                    <OpenInFullIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    ref={optionsButtonRef}
                    onClick={() => setOptionsMenuOpen(true)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </Stack>
              <Box
                sx={{
                  height: GRAPH_HEIGHT,
                  maxHeight: GRAPH_HEIGHT,
                }}
              >
                <BaseGraph
                  graph={graph}
                  metrics={metrics ?? []}
                  key={graph.desiredWidth}
                  height={GRAPH_HEIGHT - 60 - (graph.description ? 29 : 0)}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {graph.description}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Box>
      </Grid>
    </>
  )
}
