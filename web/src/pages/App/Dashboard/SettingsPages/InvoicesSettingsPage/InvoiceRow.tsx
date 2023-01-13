import { useMemo } from 'react'

import { Button, TableCell, TableRow, Tooltip, useTheme } from '@mui/material'
import { InvoicesQuery } from 'types/graphql'

import { CustomChip } from 'src/components/custom-mui'
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
    <TableRow key={invoice.id}>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
        }}
      >
        {invoice.number}
      </TableCell>
      <TableCell>{prettyDate}</TableCell>
      <TableCell>{prettyTotal}</TableCell>
      <TableCell>
        <CustomChip
          label={invoice.status}
          color={invoice.status === 'paid' ? 'success' : 'warning'}
        />
      </TableCell>
      <TableCell align="right">
        {invoice.invoice_pdf ? (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.open(invoice.invoice_pdf as string, '_blank')}
            size="small"
            sx={{
              p: 0.5,
              mr: 1,
            }}
          >
            Invoice
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
              Invoice
            </Button>
          </Tooltip>
        )}
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
            }}
          >
            Pay
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
