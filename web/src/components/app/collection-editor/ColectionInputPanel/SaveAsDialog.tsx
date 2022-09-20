import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

type SaveAsDialogProps = {
  open: boolean
  onClose: () => void
  onSave: (name: string) => void
}

export const SaveAsDialog = ({ open, onClose, onSave }: SaveAsDialogProps) => {
  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required').max(255),
    }),
    onSubmit: async (values) => {
      onSave(values.name)
      handleClose()
    },
  })

  const handleClose = () => {
    formik.resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogTitle>Save as copy</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new name for the copied folder. All requests in the folder
            will be copied.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button disabled={formik.isSubmitting} type="submit">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
