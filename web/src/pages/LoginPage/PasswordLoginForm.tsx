import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  Button,
  FormHelperText,
  Stack,
  TextField,
} from '@mui/material'
import { useFormik } from 'formik'
import * as queryString from 'query-string'
import * as Yup from 'yup'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes, useLocation } from '@redwoodjs/router'

type PasswordLoginFormProps = {
  suggestedEmail?: string
}

const PasswordLoginForm = ({ suggestedEmail }: PasswordLoginFormProps) => {
  const { isAuthenticated, logIn } = useAuth()
  const { search } = useLocation()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const { redirectTo } = queryString.parse(search || '')
      if (typeof redirectTo === 'string') {
        navigate(redirectTo)
        setIsRedirecting(true)
      } else if (!isRedirecting) {
        navigate(routes.dashboard())
      }
    }
  }, [isAuthenticated, isRedirecting, search])

  const formik = useFormik({
    initialValues: {
      email:
        suggestedEmail !== 'undefined' && suggestedEmail !== undefined
          ? suggestedEmail
          : '',
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
      const response = await logIn({
        username: values.email,
        password: values.password,
      }).catch((error) => {
        helpers.setFieldError('submit', error.message)
      })

      if (response.message) {
        helpers.setStatus({ success: false })
        helpers.setErrors({ submit: response.message })
        helpers.setSubmitting(false)
      } else if (response.error) {
        helpers.setStatus({ success: false })
        helpers.setErrors({ submit: response.error })
        helpers.setSubmitting(false)
      }
    },
  })

  return (
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
          <FormHelperText error>{formik.errors.submit}</FormHelperText>
        )}
        <Button
          disabled={formik.isSubmitting}
          fullWidth
          size="large"
          type="submit"
          variant="contained"
        >
          Login
        </Button>
        <Alert severity="warning">
          APITeam will never ask you for your password via email or support
          channels
        </Alert>
      </Stack>
    </form>
  )
}

export default PasswordLoginForm
