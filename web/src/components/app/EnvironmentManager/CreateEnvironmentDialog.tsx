import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

type CreateEnvironmentDialogProps = {
  show: boolean
  setShowCallback: (show: boolean) => void
  onCreate: (name: string) => void
}

export const CreateEnvironmentDialog = ({
  show,
  setShowCallback,
  onCreate,
}: CreateEnvironmentDialogProps) => {
  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
    }),
    onSubmit: (values) => {
      onCreate(values.name)
      handleClose()
    },
  })

  const handleClose = () => {
    formik.resetForm()
    setShowCallback(false)
  }

  return (
    <Dialog open={show} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Create Environment</DialogTitle>
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogContent>
          <DialogContentText>
            Enter the name of the environment you want to create
          </DialogContentText>
          <TextField
            label="Name"
            name="name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.name}
            helperText={formik.touched.name && formik.errors.name}
            error={Boolean(formik.touched.name && formik.errors.name)}
            fullWidth
            sx={{
              marginTop: 2,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" color="primary">
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
