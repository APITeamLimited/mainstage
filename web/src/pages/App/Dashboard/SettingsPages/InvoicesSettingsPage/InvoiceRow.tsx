import { useMemo } from 'react'

import {
  Button,
  Chip,
  TableCell,
  TableRow,
  Tooltip,
  useTheme,
} from '@mui/material'
import { InvoicesQuery } from 'types/graphql'

import { prettyPrintCents } from 'src/layouts/Landing/components/pricing'

type InvoiceRowProps = {
  invoice: InvoicesQuery['invoices'][0]
}

export const InvoiceRow = ({ invoice }: InvoiceRowProps) => {
  const theme = useTheme()

  const prettyDate = useMemo(
    () => new Date(invoice.created * 1000).toLocaleDateString(),
    [invoice.created]
  )

  const prettyTotal = useMemo(
    () => `${prettyPrintCents(invoice.total)}`,
    [invoice.total]
  )

  return (
    <TableRow>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
        }}
      >
        {invoice.description ?? 'No description'}
      </TableCell>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
        }}
      >
        {invoice.number}
      </TableCell>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
        }}
      >
        {prettyDate}
      </TableCell>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
        }}
      >
        {prettyTotal}
      </TableCell>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
        }}
      >
        <Chip
          label={
            invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
          }
          color={invoice.status === 'paid' ? 'success' : 'warning'}
          size="small"
        />
      </TableCell>
      <TableCell
        align="right"
        sx={{
          borderColor: theme.palette.divider,
        }}
      >
        {invoice.status === 'open' && invoice.hosted_invoice_url && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() =>
              window.open(invoice.hosted_invoice_url as string, '_blank')
            }
            size="small"
            sx={{
              p: 0.5,
              mr: 1,
            }}
          >
            Pay
          </Button>
        )}
        {invoice.invoice_pdf ? (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.open(invoice.invoice_pdf as string, '_blank')}
            size="small"
            sx={{
              p: 0.5,
            }}
          >
            Download
          </Button>
        ) : (
          <Tooltip title="Invoice not available yet">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              disabled
              sx={{
                p: 0.5,
                mr: 1,
              }}
            >
              Download
            </Button>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  )
}
