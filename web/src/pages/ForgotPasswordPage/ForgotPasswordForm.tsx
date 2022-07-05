import { useEffect } from 'react'

import {
  Alert,
  Box,
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
      }

      navigate(routes.login())
    },
  })

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
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
      <Stack spacing={2}>
        {formik.errors.submit ? (
          <Box>
            <FormHelperText error>{formik.errors.submit}</FormHelperText>
          </Box>
        ) : (
          <Box sx={{ mb: -1 }} />
        )}
        <Box>
          <Button
            disabled={formik.isSubmitting}
            fullWidth
            size="large"
            type="submit"
            variant="contained"
          >
            Submit
          </Button>
        </Box>
        <Box>
          <Alert severity="info">
            If the email address you provided is associated with an account, you
            shall receive an email with a link to reset your password
          </Alert>
        </Box>
      </Stack>
    </form>
  )
}

export default ForgotPasswordForm
