import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  FormHelperText,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Stack,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes, useLocation } from '@redwoodjs/router'

const PasswordLoginForm = () => {
  const { isAuthenticated, signUp } = useAuth()
  const { search } = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      if (/redirectTo/.test(search || '')) {
        const newPath = (search || '').split('=').slice(-1).join()
        navigate(newPath)
      } else {
        navigate(routes.dashboard())
      }
    }
  }, [isAuthenticated, search])

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().max(255).required('First name is required'),
      lastName: Yup.string().max(255).required('Last name is required'),
      email: Yup.string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
      password: Yup.string().max(255).required('Password is required'),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      const response = await signUp({
        username: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      }).catch((error) => {
        helpers.setFieldError('submit', error.message)
      })

      if (response.message) {
        helpers.setStatus({ success: false })
        helpers.setErrors({ submit: response.message })
        helpers.setSubmitting(false)
      } else if (response.error) {
        // If error contains 'username', change the field name to 'email'
        const errorMessage = response.error.includes('Username')
          ? response.error.replace('Username', 'Email')
          : response.error

        helpers.setStatus({ success: false })
        helpers.setErrors({ submit: errorMessage })
        helpers.setSubmitting(false)
      }
    },
  })

  const [activeStep, setActiveStep] = useState(0)

  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate firstName and lastName fields only
      const errors = {
        ...(await formik.validateForm()),
        email: '',
        password: '',
        submit: null,
      }

      // Set fields as touched
      formik.setTouched({
        firstName: true,
        lastName: true,
      })

      // Check if there are any errors
      if (!errors.firstName && !errors.lastName) {
        setActiveStep(activeStep + 1)
      }
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.dashboard())
    }
  }, [isAuthenticated])

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <Stepper activeStep={activeStep} orientation="vertical">
        <Step>
          <StepLabel>Name</StepLabel>
          <StepContent>
            <TextField
              error={Boolean(
                formik.touched.firstName && formik.errors.firstName
              )}
              fullWidth
              helperText={formik.touched.firstName && formik.errors.firstName}
              label="First Name"
              margin="normal"
              name="firstName"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.firstName}
            />
            <TextField
              error={Boolean(formik.touched.lastName && formik.errors.lastName)}
              fullWidth
              helperText={formik.touched.lastName && formik.errors.lastName}
              label="Surname"
              margin="normal"
              name="lastName"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.lastName}
            />
            <Button variant="contained" onClick={handleNext} sx={{ mt: 1 }}>
              Next
            </Button>
          </StepContent>
        </Step>
        <Step>
          <StepLabel>Email and Password</StepLabel>
          <StepContent>
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
            <Stack spacing={2}>
              {formik.errors.submit ? (
                <Box>
                  <FormHelperText error>{formik.errors.submit}</FormHelperText>
                </Box>
              ) : (
                <Box sx={{ mb: -1 }} />
              )}
              <Box>
                <Button onClick={handleBack}>Back</Button>
              </Box>
              <Button
                disabled={formik.isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                Signup
              </Button>
            </Stack>
          </StepContent>
        </Step>
      </Stepper>
    </form>
  )
}

export default PasswordLoginForm
