import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'

import { createProjectDialogStateVar } from 'src/components/app/dialogs'

export const BlankProjectsSection = () => {
  const theme = useTheme()

  return (
    <Stack
      direction="column"
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{
        paddingY: 10,
      }}
    >
      <Typography variant="body1" color={theme.palette.text.primary}>
        Create your first project to get started with APITeam
      </Typography>
      <Typography variant="body2" color={theme.palette.text.secondary}>
        Projects group related collections, environments and more together
      </Typography>
      <Box>
        <Button
          variant="outlined"
          color="primary"
          onClick={() =>
            createProjectDialogStateVar({
              isOpen: true,
            })
          }
        >
          Create Project
        </Button>
      </Box>
    </Stack>
  )
}
