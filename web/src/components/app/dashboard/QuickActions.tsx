import { Typography, Paper, Stack, Divider, Link, Box } from '@mui/material'

import { createProjectDialogStateVar } from '../dialogs'

const QuickActionItem = ({
  children,
  onClick,
}: {
  children?: React.ReactNode
  onClick: () => void
}) => {
  return (
    <Box
      sx={{
        paddingLeft: 3,
        paddingRight: 2,
      }}
    >
      <Link
        sx={{
          display: 'list-item',
          cursor: 'pointer',
          listStylePosition: 'inside',

          textDecoration: 'none',
        }}
        onClick={onClick}
      >
        {children}
      </Link>
    </Box>
  )
}

export const QuickActions = () => {
  const handleCreateProjectDialogOpen = () => {
    createProjectDialogStateVar({ isOpen: true })
  }

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          paddingY: 2,
          minWidth: 300,
        }}
      >
        <Stack spacing={2}>
          <Typography
            variant="h6"
            sx={{
              marginLeft: 4,
              marginRight: 2,
            }}
          >
            Quick Actions
          </Typography>
          <Divider />
          <QuickActionItem onClick={handleCreateProjectDialogOpen}>
            Create a new project
          </QuickActionItem>
        </Stack>
      </Paper>
    </>
  )
}
