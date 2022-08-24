import {
  Stack,
  Typography,
  Box,
  ListItemText,
  ListItemAvatar,
  ListItem,
  Avatar,
  useTheme,
  Button,
  Link,
  Paper,
} from '@mui/material'

import { Link as RouterLink, routes } from '@redwoodjs/router'

export const DocsHelp = () => {
  const theme = useTheme()

  return (
    <>
      <Stack spacing={6} marginY={6}>
        <Typography variant="h5">Docs</Typography>
        <Paper
          sx={{
            backgroundColor: theme.palette.background.default,
          }}

        >
          <Stack margin={2} spacing={2} alignItems="center">
            <Typography variant="h6" color={theme.palette.text.primary}>
              Looking for the docs?
            </Typography>
            <Typography variant="body2" color={theme.palette.text.secondary}>
              Check out the APITeam docs to learn more about how to use our
              platform
            </Typography>
            <RouterLink
              to={routes.docs()}
              style={{
                textDecoration: 'none',
              }}
            >
              <Button
                variant="outlined"
                color="primary"
              >
                APITeam Docs
              </Button>
            </RouterLink>
          </Stack>
        </Paper>
      </Stack>
    </>
  )
}
