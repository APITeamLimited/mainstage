import React from 'react'

import { Box } from '@mui/material'
import Paper from '@mui/material/Paper'

import type { MRT_TableInstance } from '..'
import { MRT_BottomToolbar } from '../toolbar/MRT_BottomToolbar'
import { MRT_TopToolbar } from '../toolbar/MRT_TopToolbar'

import { MRT_TableContainer } from './MRT_TableContainer'

interface Props {
  table: MRT_TableInstance
}

export const MRT_TablePaper = ({ table }: Props) => {
  const {
    getState,
    options: {
      enableBottomToolbar,
      enableTopToolbar,
      muiTablePaperProps,
      renderBottomToolbar,
      renderTopToolbar,
    },
    refs: { tablePaperRef },
  } = table
  const { isFullScreen } = getState()

  const tablePaperProps =
    muiTablePaperProps instanceof Function
      ? muiTablePaperProps({ table })
      : muiTablePaperProps

  return (
    <Paper
      elevation={0}
      {...tablePaperProps}
      ref={(ref: HTMLDivElement) => {
        tablePaperRef.current = ref
        if (tablePaperProps?.ref) {
          //@ts-ignore
          tablePaperProps.ref.current = ref
        }
      }}
      sx={(theme) => ({
        transition: 'all 150ms ease-in-out',
        ...(tablePaperProps?.sx instanceof Function
          ? tablePaperProps?.sx(theme)
          : (tablePaperProps?.sx as any)),
        backgroundColor: theme.palette.background.default,
      })}
      style={{
        ...tablePaperProps?.style,
        ...(isFullScreen
          ? {
              height: '100vh',
              margin: 0,
              maxHeight: '100vh',
              maxWidth: '100vw',
              padding: 0,
              width: '100vw',
            }
          : {
              height: '100%',
              maxHeight: '100%',
              display: 'flex',
              overflow: 'hidden',
              flexDirection: 'column',
            }),
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
        }}
      >
        {enableTopToolbar &&
          (renderTopToolbar instanceof Function
            ? renderTopToolbar({ table })
            : renderTopToolbar ?? <MRT_TopToolbar table={table} />)}
      </Box>

      <MRT_TableContainer table={table} />
      <Box
        sx={{
          flexShrink: 0,
        }}
      >
        {enableBottomToolbar &&
          (renderBottomToolbar instanceof Function
            ? renderBottomToolbar({ table })
            : renderBottomToolbar ?? <MRT_BottomToolbar table={table} />)}
      </Box>
    </Paper>
  )
}
