import { Alert, Box, Button, FormHelperText, TextField } from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { useAuth } from '@redwoodjs/auth'

const PasswordLoginForm = () => {
  const { logIn } = useAuth()

  const formik = useFormik({
    initialValues: {
      email: 'demo@devias.io',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      console.log('values', {
        username: values.email,
        password: values.password,
      })
      const response = await logIn({
        email: values.email,
        password: values.password,
      }).catch((error) => {
        helpers.setFieldError('submit', error.message)
      })

      console.log(response)

      if (response.message) {
        helpers.setStatus({ success: false })
        helpers.setErrors({ submit: response.message })
        helpers.setSubmitting(false)
      } else if (response.error) {
        console.log('error', response.error)
        helpers.setStatus({ success: false })
        helpers.setErrors({ submit: response.error.message })
        helpers.setSubmitting(false)
      }
    },
  })

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <TextField
        autoFocus
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
      <TextField
        error={Boolean(formik.touched.password && formik.errors.password)}
        fullWidth
        helperText={formik.touched.password && formik.errors.password}
        label="Password"
        margin="normal"
        name="password"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        type="password"
        value={formik.values.password}
      />
      {formik.errors.submit && (
        <Box sx={{ mt: 3 }}>
          <FormHelperText error>{formik.errors.submit}</FormHelperText>
        </Box>
      )}
      <Box sx={{ mt: 2 }}>
        <Button
          disabled={formik.isSubmitting}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
        >
          Log In
        </Button>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Alert severity="warning">
          APITeam will never ask you for your password
        </Alert>
      </Box>
    </form>
  )
}

export default PasswordLoginForm
