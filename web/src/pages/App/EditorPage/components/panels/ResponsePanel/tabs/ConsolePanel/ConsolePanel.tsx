/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react'

import type {
  ConsoleMessage,
  ConsoleMessagesPoller,
  LocationPoller,
  Locations,
} from '@apiteam/datapeak'
import SaveIcon from '@mui/icons-material/Save'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import { IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material'
import type { Row } from '@tanstack/react-table'

import { useDatapeakModule } from 'src/contexts/imports/datapeak-provider'
import MaterialReactTable, { MRT_ColumnDef } from 'src/lib/material-react-table'

import { ChipSelect } from './ChipSelect'
import { ConsoleDetailRow } from './ConsoleDetailRow'
import { LevelChip } from './LevelChip'

export type FilterLevel = 'error' | 'warn' | 'info' | 'debug'
export const filterLevels: FilterLevel[] = ['error', 'warn', 'info', 'debug']

export type FilterArgs = {
  locations: Locations
  levels: FilterLevel[]
  message: string
}

export const defaultFilterArgs: FilterArgs = {
  locations: [],
  levels: [],
  message: '',
}

const numberFormatter = new Intl.NumberFormat('en-US')

const getTotalCount = (countRecord: ConsoleMessage['count']) => {
  // Return global count if key present
  if (countRecord.global) {
    return countRecord.global
  }

  // Return sum of all other counts
  return Object.values(countRecord).reduce((acc, count) => acc + count, 0)
}

type ConsolePanelProps = {
  testInfoId: string
  setActionArea: (actionArea: React.ReactNode) => void
}

export const ConsolePanel = ({
  testInfoId,
  setActionArea,
}: ConsolePanelProps) => {
  const datapeakModule = useDatapeakModule()

  const theme = useTheme()

  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([])
  const [consoleMessagesPoller, setConsoleMessagesPoller] =
    useState<ConsoleMessagesPoller | null>(null)

  const [locations, setLocations] = useState<Locations>([])
  const [locationsPoller, setLocationsPoller] = useState<LocationPoller | null>(
    null
  )

  useEffect(() => {
    setConsoleMessagesPoller(
      new datapeakModule.ConsoleMessagesPoller(testInfoId, setConsoleMessages)
    )
    setLocationsPoller(
      new datapeakModule.LocationPoller(testInfoId, setLocations)
    )

    return () => {
      consoleMessagesPoller?.destroy()
      locationsPoller?.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setActionArea(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columns = useMemo<MRT_ColumnDef<ConsoleMessage>[]>(
    () => [
      {
        accessorKey: 'message',
        enableClickToCopy: true,
        header: 'Message',
        size: 300,
        Cell: ({ cell }) => (
          <Typography
            noWrap
            variant="body2"
            classes={theme.components?.MuiInput}
          >
            {cell.getValue<ConsoleMessage['message']>()}
          </Typography>
        ),
        filterVariant: 'text',
        columnFilterModeOptions: [
          'fuzzy',
          'equals',
          'contains',
          'startsWith',
          'endsWith',
        ],
        enableColumnFilterModes: true,
        sortingFn: 'alphanumericCaseSensitive',
        PlaceholderCell: () => (
          <Typography noWrap variant="body2">
            asdasd
          </Typography>
        ),
      },
      {
        accessorKey: 'level',
        header: 'Level',
        size: 150,
        Cell: ({ cell }) => (
          <LevelChip
            label={cell.getValue<ConsoleMessage['level']>()}
            size="small"
          />
        ),
        filterVariant: 'multi-select',
        enableColumnFilterModes: false,
        columnFilterModeOptions: ['equals'],
        filterSelectOptions: filterLevels,
        sortingFn: (a, b) =>
          // Lower index means higher priority
          filterLevels.indexOf(a.original.level as FilterLevel) -
          filterLevels.indexOf(b.original.level as FilterLevel),
        Filter: ({ column }) => {
          const filterValue = (column.getFilterValue() ?? []) as FilterLevel[]

          return (
            <ChipSelect
              label="Level"
              options={filterLevels}
              selected={filterValue}
              setSelected={column.setFilterValue}
              chipComponent={LevelChip}
              size="small"
              selectSx={{
                width: '100%',
              }}
              emptyText="Filter by Level"
            />
          )
        },
      },
      {
        accessorKey: 'count',
        header: 'Count (Total)',
        size: 150,
        Cell: ({ cell }) => (
          <Typography noWrap variant="body2">
            {numberFormatter.format(
              getTotalCount(cell.getValue() as ConsoleMessage['count'])
            )}
          </Typography>
        ),
        // Disable filtering for count
        enableColumnFilterModes: false,
        sortingFn: (a, b) =>
          getTotalCount(a.original.count) - getTotalCount(b.original.count),
        filterVariant: 'multi-select',
        columnFilterModeOptions: ['equals'],
        filterSelectOptions: locations,
        filterFn: (
          row: Row<ConsoleMessage>,
          _: string,
          filterValues: Locations
        ) =>
          // Ensure at least one location is in the filter
          Object.keys(row.original.count).some((location) =>
            filterValues.includes(location)
          ),
        // return (
        Filter: ({ column }) => {
          const filterValue = (column.getFilterValue() ?? []) as Locations

          return (
            <ChipSelect
              label="Location"
              options={locations}
              selected={filterValue}
              setSelected={column.setFilterValue}
              emptyText="Filter by Location"
              size="small"
              selectSx={{
                width: '100%',
              }}
            />
          )
        },
      },
      {
        accessorKey: 'firstOccurred',
        header: 'First Occured',
        size: 100,
        Cell: ({ cell }) => (
          <Typography noWrap variant="body2">
            {cell.getValue<ConsoleMessage['firstOccurred']>()}
          </Typography>
        ),
        filterVariant: 'range',
        enableColumnFilterModes: false,
        enableColumnFilter: false,
        sortingFn: (a, b) =>
          new Date(a.original.firstOccurred).getTime() -
          new Date(b.original.firstOccurred).getTime(),
      },
      {
        accessorKey: 'lastOccurred',
        header: 'Last Occured',
        size: 100,
        Cell: ({ cell }) => (
          <Typography noWrap variant="body2">
            {cell.getValue<ConsoleMessage['lastOccurred']>()}
          </Typography>
        ),
        filterVariant: 'range',
        enableColumnFilterModes: false,
        enableColumnFilter: false,
        sortingFn: (a, b) =>
          new Date(a.original.lastOccurred).getTime() -
          new Date(b.original.lastOccurred).getTime(),
      },
    ],

    [locations]
  )

  return (
    <MaterialReactTable
      columns={columns}
      data={consoleMessages}
      enableFilters
      enableColumnFilterModes
      enableColumnResizing
      enableFullScreenToggle={false}
      enableRowSelection
      muiSelectCheckboxProps={{
        size: 'small',
      }}
      muiSelectAllCheckboxProps={{
        size: 'small',
      }}
      muiTableHeadCellProps={{
        sx: {
          minWidth: 0,
        },
      }}
      muiTableBodyCellProps={{
        sx: {
          minWidth: 0,
        },
      }}
      // Add custom actions
      muiToolbarAlertBannerChipProps={{
        size: 'small',
      }}
      renderTopToolbarCustomActions={({ table }) => {
        const selectedRows = table
          .getSelectedRowModel()
          .flatRows.map((row) => row.original)

        return (
          <Stack direction="row">
            {selectedRows.length > 0 && (
              <Tooltip title="Export Selected">
                <IconButton
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(selectedRows)], {
                      type: 'application/json',
                    })

                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url

                    link.setAttribute(
                      'download',
                      `console-messages-selected-${new Date().toISOString()}.json`
                    )

                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                  }}
                >
                  <SaveAltIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Export All">
              <IconButton
                onClick={() => {
                  const blob = new Blob([JSON.stringify(consoleMessages)], {
                    type: 'application/json',
                  })

                  const url = window.URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url

                  link.setAttribute(
                    'download',
                    `console-messages-all-${new Date().toISOString()}.json`
                  )

                  document.body.appendChild(link)
                  link.click()
                  link.remove()
                }}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }}
      initialState={{
        showColumnFilters: true,
        columnVisibility: {
          firstOccurred: false,
          lastOccurred: false,
        },
        density: 'compact',
      }}
      noResultsMessage="Console logs from within the test script will appear here."
      renderDetailPanel={({ row }) => (
        <ConsoleDetailRow
          consoleMessage={row.original}
          namespace={`${testInfoId}${row.id}`}
        />
      )}
    />
  )
}
