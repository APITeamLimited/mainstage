import { useEffect, useState } from 'react'

import {
  Alert,
  Snackbar,
  Button,
  FormHelperText,
  Stack,
  TextField,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes } from '@redwoodjs/router'

const ForgotPasswordForm = () => {
  const { isAuthenticated, forgotPassword } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.dashboard())
    }
  }, [isAuthenticated])

  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )

  const formik = useFormik({
    initialValues: {
      email: '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      const response = await forgotPassword(values.email)

      if (response.error) {
        helpers.setStatus({ success: false })
        helpers.setErrors({ submit: response.error })
        helpers.setSubmitting(false)
        return
      }

      setSnackSuccessMessage('Email sent, check your inbox')
    },
  })

  return (
    <>
      <Snackbar
        open={!!snackErrorMessage}
        onClose={() => setSnackErrorMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackErrorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!snackSuccessMessage}
        onClose={() => setSnackSuccessMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackSuccessMessage}
        </Alert>
      </Snackbar>
      <form noValidate onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          <TextField
            error={Boolean(formik.touched.email && formik.errors.email)}
            fullWidth
            helperText={formik.touched.email && formik.errors.email}
            label="Email Address"
            margin="normal"
            name="email"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            type="email"
            value={formik.values.email}
          />
          {formik.errors.submit && (
            <FormHelperText error>{formik.errors.submit}</FormHelperText>
          )}
          <Button
            disabled={formik.isSubmitting}
            size="large"
            type="submit"
            variant="contained"
          >
            Submit
          </Button>
          <Alert severity="info">
            If the email address you provided is associated with an account, you
            shall receive an email with a link to reset your password
          </Alert>
        </Stack>
      </form>
    </>
  )
}

export default ForgotPasswordForm
