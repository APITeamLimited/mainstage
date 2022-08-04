import AddCircleOutlineTwoToneIcon from '@mui/icons-material/AddCircleOutlineTwoTone'
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from '@mui/material'
import { ReactComponent as CurvedArrow } from 'public/app/curved-arrow.svg'

import { createProjectDialogStateVar } from 'src/components/app/dialogs'

export const BlankProjectsSection = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
      }}
    >
      <Stack
        direction="column"
        spacing={2}
        alignItems="center"
        justifyContent="center"
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
    </Box>
  )
}
