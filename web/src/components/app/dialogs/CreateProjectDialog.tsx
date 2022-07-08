import { makeVar, useReactiveVar } from '@apollo/client'
import {
  Button,
  Dialog,
  DialogContent,
  TextField,
  DialogTitle,
  DialogActions,
  Divider,
  Stack,
  Typography,
  FormLabel,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import {
  activeWorkspaceVar,
  generateLocalProject,
  localProjectsVar,
} from 'src/contexts/reactives'

type CreateProjectDialogState = {
  isOpen: boolean
}

const initialCreateProjectDialogState: CreateProjectDialogState = {
  isOpen: false,
}

export const createProjectDialogStateVar = makeVar(
  initialCreateProjectDialogState
)

export const CreateProjectDialog = () => {
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)
  const localProjects = useReactiveVar(localProjectsVar)
  const { isOpen } = useReactiveVar(createProjectDialogStateVar)

  const formik = useFormik({
    initialValues: {
      name: 'New Project',
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(25).required('Projects must have a name'),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      if (activeWorkspace.__typename === 'Anonymous') {
        const newProject = generateLocalProject({ name: values.name })
        localProjectsVar(localProjects.concat(newProject))
      } else {
        throw 'CreateProjectDialog is not supported for remote workspaces yet'
      }
      handleClose()
    },
  })

  const handleClose = () => {
    formik.resetForm()
    createProjectDialogStateVar({ isOpen: false })
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogTitle>New Project</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ my: 2 }}>
            <Typography variant="body1">
              Create a new project for your workspace
            </Typography>
            <TextField
              margin="dense"
              id="name"
              label="Project Name"
              name="name"
              fullWidth
              variant="outlined"
              sx={{ m: 0 }}
              size="small"
              value={formik.values.name}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <Divider variant="middle" />
            <FormLabel>Access Options</FormLabel>
            <Typography variant="body1">Unimplemented</Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={formik.isSubmitting}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
