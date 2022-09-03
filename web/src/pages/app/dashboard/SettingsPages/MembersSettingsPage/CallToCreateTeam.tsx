import { useState } from 'react'

import { Button, Card, Stack, Typography, Box } from '@mui/material'

import { navigate, routes } from '@redwoodjs/router'

import { CreateTeamDialog } from 'src/layouts/App/components/TopNavApp/WorkspaceSwitcher/CreateTeamDialog'

export const CallToCreateTeam = () => {
  const [openCreateTeamDialog, setOpenCreateTeamDialog] = useState(false)

  return (
    <>
      <CreateTeamDialog
        isOpen={openCreateTeamDialog}
        onClose={(successful: boolean) => {
          if (successful) {
            navigate(routes.dashboard())
            setOpenCreateTeamDialog(false)
          } else {
            setOpenCreateTeamDialog(false)
          }
        }}
      />
      <Card
        sx={{
          width: '100%',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            paddingY: 4,
            paddingX: 2,
          }}
          alignItems="center"
        >
          <Typography variant="h5">
            Members are only available on teams
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a team to collaborate with others and unlock more features.
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenCreateTeamDialog(true)}
            >
              Create a team
            </Button>
          </Box>
        </Stack>
      </Card>
    </>
  )
}
