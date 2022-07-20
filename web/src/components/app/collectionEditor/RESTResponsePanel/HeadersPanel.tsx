import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  TableHead,
  Table,
  TableBody,
  TableRow,
  TableContainer,
  TableCell,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material'

type HeadersPanelProps = {
  headers: {
    key: string
    value: string | string[]
  }[]
}

export const HeadersPanel = ({ headers }: HeadersPanelProps) => {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="flex-end"
        sx={{
          marginBottom: 2,
        }}
      >
        <Tooltip title="Copy Headers">
          <IconButton>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {headers.map((header, index) => (
              <TableRow key={index}>
                <TableCell
                  sx={{
                    width: '50%',
                  }}
                >
                  {header.key}
                </TableCell>
                <TableCell
                  sx={{
                    width: '50%',
                  }}
                >
                  {header.value.toString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
