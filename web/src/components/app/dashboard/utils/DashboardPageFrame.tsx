import { Divider, Stack, Typography } from '@mui/material'

type DashboardPageFrameProps = {
  title?: string
  children?: React.ReactNode
  actionArea?: React.ReactNode
  disableDivider?: boolean
}

export const DashboardPageFrame = ({
  title,
  children,
  actionArea,
  disableDivider,
}: DashboardPageFrameProps) => {
  return (
    <Stack spacing={4}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Typography variant="h4">{title}</Typography>
        {actionArea}
      </Stack>
      {!disableDivider && <Divider />}
      {children}
    </Stack>
  )
}
