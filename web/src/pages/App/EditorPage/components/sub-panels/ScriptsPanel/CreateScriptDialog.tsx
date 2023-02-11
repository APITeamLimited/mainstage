import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Box,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

type CreateScriptDialogProps = {
  isOpen: boolean
  onClose: () => void
  onCreate: (scriptName: string) => void
  existingScriptNames: string[]
}

export const CreateScriptDialog = ({
  isOpen,
  onClose,
  onCreate,
  existingScriptNames,
}: CreateScriptDialogProps) => {
  const formik = useFormik({
    initialValues: {
      scriptName: '',
    },
    validationSchema: Yup.object({
      // Ensure script 1-25 characters and ends in .js and is not already taken
      scriptName: Yup.string()
        .max(25, 'Script name must be 25 characters or less')
        .matches(/\.js$/, 'Script name must end in .js')
        .required('Script name is required')
        .notOneOf(existingScriptNames, 'Script name already exists'),
    }),
    onSubmit: (values) => {
      onCreate(values.scriptName)
      handleClose()
    },
  })

  const handleClose = () => {
    onClose()
    formik.resetForm()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogTitle>New Script</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Script Name"
              name="scriptName"
              value={formik.values.scriptName}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={Boolean(
                formik.touched.scriptName && formik.errors.scriptName
              )}
              helperText={formik.touched.scriptName && formik.errors.scriptName}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
