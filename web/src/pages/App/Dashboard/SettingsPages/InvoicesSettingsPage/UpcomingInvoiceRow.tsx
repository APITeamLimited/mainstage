import { Chip, TableCell, TableRow, useTheme } from '@mui/material'
import { InvoicesQuery } from 'types/graphql'

import { prettyPrintCents } from 'src/layouts/Landing/components/pricing'

type UpcomingInvoiceRowProps = {
  upcomingInvoice: InvoicesQuery['upcomingInvoice']
}

export const UpcomingInvoiceRow = ({
  upcomingInvoice,
}: UpcomingInvoiceRowProps) => {
  const theme = useTheme()

  if (!upcomingInvoice) {
    return <></>
  }

  return (
    <TableRow>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
          color: theme.palette.text.secondary,
        }}
      >
        Upcoming - {upcomingInvoice.planName}
      </TableCell>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
          color: theme.palette.text.secondary,
        }}
      />
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
          color: theme.palette.text.secondary,
        }}
      >
        {new Date(upcomingInvoice.period_end * 1000).toLocaleDateString()}
      </TableCell>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
          color: theme.palette.text.secondary,
        }}
      >
        ${prettyPrintCents(upcomingInvoice.total)}
      </TableCell>
      <TableCell
        sx={{
          borderColor: theme.palette.divider,
          color: theme.palette.text.secondary,
        }}
      >
        <Chip label="Pending" variant="outlined" size="small" />
      </TableCell>
      <TableCell
        align="right"
        sx={{
          borderColor: theme.palette.divider,
          color: theme.palette.text.secondary,
        }}
      />
    </TableRow>
  )
}
