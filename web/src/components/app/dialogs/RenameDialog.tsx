import {
  Box,
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

type RenameDialogProps = {
  show: boolean
  original?: string
  onRename: (newName: string) => void
  onClose: () => void
  title?: string
}

export const RenameDialog = ({
  show,
  original = '',
  onClose,
  onRename,
  title = 'Rename',
}: RenameDialogProps) => {
  const formik = useFormik({
    initialValues: {
      name: original,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(25).required('Name is required'),
    }),
    onSubmit: (values) => {
      onRename(values.name)
      onClose()
    },
  })

  return (
    <Dialog
      open={show}
      onClose={onClose}
      aria-labelledby={title}
      maxWidth="xs"
      fullWidth
    >
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box my={2}>
            <TextField
              label="Name"
              name="name"
              value={formik.values.name}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              variant="outlined"
              size="small"
              fullWidth
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit">Rename</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
