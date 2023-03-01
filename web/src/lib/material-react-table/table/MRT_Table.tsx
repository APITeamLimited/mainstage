import React, { useCallback, useMemo } from 'react'

import { useTheme } from '@mui/material'
import Table from '@mui/material/Table'
import {
  defaultRangeExtractor,
  Range,
  useVirtualizer,
  Virtualizer,
} from '@tanstack/react-virtual'

import { useSimplebarReactModule } from 'src/contexts/imports'

import type { MRT_TableInstance } from '..'
import { Memo_MRT_TableBody, MRT_TableBody } from '../body/MRT_TableBody'
import { parseCSSVarId } from '../column.utils'
import { MRT_TableFooter } from '../footer/MRT_TableFooter'
import { MRT_TableHead } from '../head/MRT_TableHead'

interface Props {
  table: MRT_TableInstance
}

export const MRT_Table = ({ table }: Props) => {
  const {
    getFlatHeaders,
    getState,
    options: {
      columns,
      columnVirtualizerInstanceRef,
      columnVirtualizerProps,
      enableColumnResizing,
      enableColumnVirtualization,
      enablePinning,
      enableStickyHeader,
      enableTableFooter,
      enableTableHead,
      layoutMode,
      memoMode,
      muiTableProps,
      noResultsMessage,
    },
    refs: { tableContainerRef },
  } = table
  const {
    columnPinning,
    columnSizing,
    columnSizingInfo,
    columnVisibility,
    isFullScreen,
  } = getState()

  const tableProps =
    muiTableProps instanceof Function ? muiTableProps({ table }) : muiTableProps

  const vProps =
    columnVirtualizerProps instanceof Function
      ? columnVirtualizerProps({ table })
      : columnVirtualizerProps

  const columnSizeVars = useMemo(() => {
    const headers = getFlatHeaders()
    const colSizes: { [key: string]: number } = {}
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]
      const colSize = header.getSize()
      colSizes[`--header-${parseCSSVarId(header.id)}-size`] = colSize
      colSizes[`--col-${parseCSSVarId(header.column.id)}-size`] = colSize
    }
    return colSizes
  }, [columns, columnSizing, columnSizingInfo, columnVisibility])

  //get first 16 column widths and average them
  const averageColumnWidth = useMemo(() => {
    if (!enableColumnVirtualization) return 0
    const columnsWidths =
      table
        .getRowModel()
        .rows[0]?.getCenterVisibleCells()
        ?.slice(0, 16)
        ?.map((cell) => cell.column.getSize() * 1.2) ?? []
    return columnsWidths.reduce((a, b) => a + b, 0) / columnsWidths.length
  }, [table.getRowModel().rows, columnPinning, columnVisibility])

  const [leftPinnedIndexes, rightPinnedIndexes] = useMemo(
    () =>
      enableColumnVirtualization && enablePinning
        ? [
            table.getLeftLeafColumns().map((c) => c.getPinnedIndex()),
            table
              .getRightLeafColumns()
              .map(
                (c) =>
                  table.getVisibleLeafColumns().length - c.getPinnedIndex() - 1
              ),
          ]
        : [[], []],
    [columnPinning, enableColumnVirtualization, enablePinning]
  )

  const columnVirtualizer:
    | Virtualizer<HTMLDivElement, HTMLTableCellElement>
    | undefined = enableColumnVirtualization
    ? useVirtualizer({
        count: table.getVisibleLeafColumns().length,
        estimateSize: () => averageColumnWidth,
        getScrollElement: () => tableContainerRef.current,
        horizontal: true,
        overscan: 3,
        rangeExtractor: useCallback(
          (range: Range) => [
            ...new Set([
              ...leftPinnedIndexes,
              ...defaultRangeExtractor(range),
              ...rightPinnedIndexes,
            ]),
          ],
          [leftPinnedIndexes, rightPinnedIndexes]
        ),
        ...vProps,
      })
    : undefined

  if (columnVirtualizerInstanceRef && columnVirtualizer) {
    columnVirtualizerInstanceRef.current = columnVirtualizer
  }

  const virtualColumns = columnVirtualizer
    ? columnVirtualizer.getVirtualItems()
    : undefined

  let virtualPaddingLeft: number | undefined
  let virtualPaddingRight: number | undefined

  if (columnVirtualizer && virtualColumns?.length) {
    virtualPaddingLeft = virtualColumns[leftPinnedIndexes.length]?.start ?? 0
    virtualPaddingRight =
      columnVirtualizer.getTotalSize() -
      (virtualColumns[virtualColumns.length - 1 - rightPinnedIndexes.length]
        ?.end ?? 0)
  }

  const props = {
    table,
    virtualColumns,
    virtualPaddingLeft,
    virtualPaddingRight,
    noResultsMessage,
  }

  return (
    <Table
      stickyHeader
      {...tableProps}
      sx={(theme) => ({
        borderCollapse: 'separate',
        tableLayout:
          layoutMode !== 'grid' && enableColumnResizing ? 'fixed' : undefined,
        ...(tableProps?.sx instanceof Function
          ? tableProps.sx(theme)
          : (tableProps?.sx as any)),
      })}
      style={{ ...columnSizeVars, ...tableProps?.style }}
    >
      {enableTableHead && <MRT_TableHead {...props} />}{' '}
      {memoMode === 'table-body' || columnSizingInfo.isResizingColumn ? (
        <Memo_MRT_TableBody columnVirtualizer={columnVirtualizer} {...props} />
      ) : (
        <MRT_TableBody columnVirtualizer={columnVirtualizer} {...props} />
      )}
      {enableTableFooter && <MRT_TableFooter {...props} />}
    </Table>
  )
}
