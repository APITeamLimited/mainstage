import {
  Box,
  Card,
  Divider,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import { InvoicesQuery, InvoicesQueryVariables } from 'types/graphql'

import { useQuery } from '@redwoodjs/web'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { InvoiceRow } from './InvoiceRow'

const minInvoiceCardHeight = 400

const INVOICES_QUERY = gql`
  query InvoicesQuery($teamId: String) {
    invoices(teamId: $teamId) {
      id
      hosted_invoice_url
      status
      invoice_pdf
      next_payment_attempt
      number
      total
      currency
      created
    }
  }
`

export const InvoicesCard = () => {
  const theme = useTheme()
  const workspaceInfo = useWorkspaceInfo()

  const { data, error } = useQuery<InvoicesQuery, InvoicesQueryVariables>(
    INVOICES_QUERY,
    {
      variables: {
        teamId: workspaceInfo.isTeam
          ? workspaceInfo.scope.variantTargetId
          : null,
      },
      pollInterval: 1000 * 60 * 5,
    }
  )

  if (error) {
    return (
      <Card
        sx={{
          minHeight: minInvoiceCardHeight,
        }}
      >
        <Box
          sx={{
            height: minInvoiceCardHeight,
          }}
        >
          <Stack
            spacing={2}
            sx={{ p: 2, height: '100%' }}
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h6" color={theme.palette.error.main}>
              Error loading invoices
            </Typography>
          </Stack>
        </Box>
      </Card>
    )
  }

  if (!data) return <Skeleton height={minInvoiceCardHeight} />

  if (data.invoices.length === 0) {
    return (
      <Card
        sx={{
          minHeight: minInvoiceCardHeight,
        }}
      >
        <Box
          sx={{
            height: minInvoiceCardHeight,
          }}
        >
          <Stack
            spacing={2}
            sx={{ p: 2, height: '100%' }}
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="h6" color="textPrimary">
              No invoices
            </Typography>
            <Typography variant="body2" color="textSecondary">
              When you have invoices, they will appear here.
            </Typography>
          </Stack>
        </Box>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        minHeight: minInvoiceCardHeight,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          p: 2,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Invoices
        </Typography>
        <Divider />
        <Table size="small" sx={{ width: '100%' }}>
          <TableHead
            sx={{
              backgroundColor: 'transparent',
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  borderColor: theme.palette.divider,
                }}
              >
                Number
              </TableCell>
              <TableCell
                sx={{
                  borderColor: theme.palette.divider,
                }}
              >
                Date
              </TableCell>
              <TableCell
                sx={{
                  borderColor: theme.palette.divider,
                }}
              >
                Amount
              </TableCell>
              <TableCell
                sx={{
                  borderColor: theme.palette.divider,
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  borderColor: theme.palette.divider,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Card>
  )
}
