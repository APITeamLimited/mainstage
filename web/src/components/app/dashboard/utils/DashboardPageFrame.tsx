import { Divider, Stack, Typography } from '@mui/material'

type DashboardPageFrameProps = {
  title: string
  children?: React.ReactNode
  actionArea?: React.ReactNode
}

export const DashboardPageFrame = ({
  title,
  children,
  actionArea,
}: DashboardPageFrameProps) => {
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Typography variant="h4">{title}</Typography>
        {actionArea}
      </Stack>
      <Divider />
      {children}
    </Stack>
  )
}
