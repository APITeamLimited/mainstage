import { Box, Button, Card, Stack, Typography, useTheme } from '@mui/material'

import { createProjectDialogStateVar } from 'src/components/app/dialogs'

export const NoProjectsCard = () => {
  const theme = useTheme()

  return (
    <Card>
      <Stack
        spacing={4}
        sx={{ p: 2, minHeight: '300px' }}
        alignItems="center"
        justifyContent="center"
      >
        <Typography fontWeight="bold" variant="h5">
          No Projects
        </Typography>
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body1"
            color={theme.palette.text.secondary}
            gutterBottom
          >
            Create your first project to get started with APITeam
          </Typography>
          <Typography variant="body1" color={theme.palette.text.secondary}>
            Projects group related collections, environments and more together
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              createProjectDialogStateVar({
                isOpen: true,
              })
            }
          >
            New Project
          </Button>
        </Box>
      </Stack>
    </Card>
  )
}
