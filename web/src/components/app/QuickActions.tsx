import { Typography, Paper, Stack, Divider, Link } from '@mui/material'

const QuickActionItem = ({
  children,
  onClick,
}: {
  children?: React.ReactNode
  onClick: () => void
}) => {
  return (
    <Link
      sx={{
        display: 'list-item',
        cursor: 'pointer',
        listStylePosition: 'inside',
      }}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

export const QuickActions = () => {
  return (
    <Paper elevation={2}>
      <Stack
        spacing={2}
        sx={{
          m: 2,
        }}
      >
        <Typography variant="h6">Quick Actions</Typography>
        <Divider />
        <QuickActionItem onClick={() => undefined}>
          Create a new project
        </QuickActionItem>
        <QuickActionItem onClick={() => undefined}>
          Create a new project
        </QuickActionItem>
      </Stack>
    </Paper>
  )
}
