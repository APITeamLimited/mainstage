import { Stack, Typography, useTheme, Button, Paper } from '@mui/material'

import { Link as RouterLink, routes } from '@redwoodjs/router'

export const DocsHelp = () => {
  const theme = useTheme()

  return (
    <>
      <Stack spacing={6} marginY={6}>
        <Typography variant="h4">Docs</Typography>
        <Paper
          sx={{
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack margin={2} spacing={2} alignItems="center">
            <Typography
              variant="h6"
              color={theme.palette.text.primary}
              align="center"
            >
              Looking for the docs?
            </Typography>
            <Typography
              variant="body1"
              color={theme.palette.text.secondary}
              align="center"
            >
              Check out the APITeam docs to learn more about how to use our
              platform
            </Typography>
            <RouterLink
              to={routes.docs()}
              style={{
                textDecoration: 'none',
              }}
            >
              <Button variant="outlined" color="primary">
                APITeam Docs
              </Button>
            </RouterLink>
          </Stack>
        </Paper>
      </Stack>
    </>
  )
}
