import { useEffect } from 'react'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  TableHead,
  Table,
  TableBody,
  TableRow,
  TableContainer,
  TableCell,
  Tooltip,
  IconButton,
  Box,
} from '@mui/material'

import { useSimplebarReactModule } from 'src/contexts/imports'

import { QuickActionArea } from './QuickActionArea'

type KeyValueResultsTableProps = {
  values: {
    key: string
    value: string
  }[]
  setActionArea?: (actionArea: React.ReactNode) => void
}

export const KeyValueResultsTable = ({
  values,
  setActionArea,
}: KeyValueResultsTableProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  useEffect(() => {
    const customActions = []

    if (values.length > 0) {
      customActions.push(
        <Tooltip title="Copy All" key="Copy All">
          <IconButton
            onClick={() =>
              // Set as space separated string with newlines between each value
              navigator.clipboard.writeText(
                `Name\tValue\n${values
                  .map(({ key, value }) => `${key}\t${value}`)
                  .join('\n')}`
              )
            }
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      )
    }

    setActionArea?.(<QuickActionArea customActions={customActions} />)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  return (
    <Box sx={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
      <SimpleBar style={{ height: '100%', maxHeight: '100%' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {values.map(({ key, value }, index) => (
                <TableRow key={index}>
                  <TableCell
                    sx={{
                      width: '50%',
                      wordBreak: 'break-all',
                    }}
                  >
                    {key}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '50%',
                      wordBreak: 'break-all',
                    }}
                  >
                    {value.toString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SimpleBar>
    </Box>
  )
}
