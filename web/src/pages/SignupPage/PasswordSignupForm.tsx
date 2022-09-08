import { useEffect, useState } from 'react'

import {
  Box,
  Button,
  Snackbar,
  Alert,
  Typography,
  FormHelperText,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Stack,
  useTheme,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import { useFormik } from 'formik'
import * as queryString from 'query-string'
import {
  GetVerifyCodeMutation,
  GetVerifyCodeMutationVariables,
} from 'types/graphql'
import * as Yup from 'yup'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes, useLocation } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

const GET_VERIFY_CODE_MUTATION = gql`
  mutation GetVerifyCodeMutation($firstName: String!, $email: String!) {
    getVerificationCode(firstName: $firstName, email: $email)
  }
`

const PasswordSignupForm = () => {
  const { isAuthenticated, signUp } = useAuth()
  const { search } = useLocation()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const theme = useTheme()

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
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      verifyCode: '',
      emailMarketing: false,
      agreeTerms: false,
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
      verifyCode: Yup.string()
        .min(6)
        .max(6)
        .required('Verify code is required'),
      emailMarketing: Yup.boolean().required('Email marketing is required'),
      agreeTerms: Yup.boolean().oneOf([true], 'You must agree to the terms'),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      const response = await signUp({
        username: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        verifyCode: values.verifyCode,
        emailMarketing: values.emailMarketing,
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

  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )

  const [getVerificationCode, { loading: codeLoading }] = useMutation<
    GetVerifyCodeMutation,
    GetVerifyCodeMutationVariables
  >(GET_VERIFY_CODE_MUTATION)

  const handleNext = async () => {
    if (activeStep === 0) {
      // Validate firstName and lastName fields only
      const errors = {
        ...(await formik.validateForm()),
        email: '',
        password: '',
        verifyCode: '',
        emailMarketing: '',
        agreeTerms: '',
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
    } else if (activeStep === 1) {
      // Validate email and password fields only
      const errors = {
        ...(await formik.validateForm()),
        firstName: '',
        lastName: '',
        verifyCode: '',
        emailMarketing: '',
        agreeTerms: '',
        submit: null,
      }

      // Set fields as touched
      formik.setTouched({
        email: true,
        password: true,
      })

      // Check if there are any errors
      if (errors.email || errors.password) return

      // Get verification code
      const { data, errors: submitErrors } = await getVerificationCode({
        variables: {
          firstName: formik.values.firstName,
          email: formik.values.email,
        },
      })

      if (submitErrors) {
        formik.setErrors({ submit: 'Failed to get verification code' })
        return
      }

      if (data?.getVerificationCode === true) {
        setActiveStep(activeStep + 1)
      } else if (data?.getVerificationCode === false) {
        formik.setErrors({ submit: 'That email is already taken' })
      } else {
        formik.setErrors({ submit: 'Failed to get verification code' })
      }
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

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
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step>
            <StepLabel>Name</StepLabel>
            <StepContent>
              <Stack spacing={2}>
                <TextField
                  error={Boolean(
                    formik.touched.firstName && formik.errors.firstName
                  )}
                  fullWidth
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
                  }
                  label="First Name"
                  margin="normal"
                  name="firstName"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.firstName}
                />
                <TextField
                  error={Boolean(
                    formik.touched.lastName && formik.errors.lastName
                  )}
                  fullWidth
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  label="Surname"
                  margin="normal"
                  name="lastName"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lastName}
                />
                {formik.errors.submit && (
                  <FormHelperText error>{formik.errors.submit}</FormHelperText>
                )}
                <Stack direction="row" spacing={2}>
                  <Button onClick={handleBack} disabled>
                    Back
                  </Button>
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                </Stack>
              </Stack>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Email and Password</StepLabel>
            <StepContent>
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
                  error={Boolean(
                    formik.touched.password && formik.errors.password
                  )}
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
                <Stack direction="row" spacing={2}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={codeLoading}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Final Steps</StepLabel>
            <StepContent>
              <Stack spacing={2}>
                <Typography
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                  variant="body2"
                >
                  We have sent an email to {formik.values.email}. Please click
                  on the link in the email to verify your email address.
                </Typography>
                <Box>
                  <Button
                    onClick={async () => {
                      const { data } = await getVerificationCode({
                        variables: {
                          firstName: formik.values.firstName,
                          email: formik.values.email,
                        },
                      })
                      if (data?.getVerificationCode === true) {
                        setSnackSuccessMessage(
                          'A new verification email has been sent'
                        )
                      } else if (data?.getVerificationCode === false) {
                        setSnackErrorMessage('That email is already taken')
                      } else {
                        setSnackErrorMessage('Failed to get verification code')
                      }
                    }}
                  >
                    Send Again
                  </Button>
                </Box>
                <TextField
                  error={Boolean(
                    formik.touched.verifyCode && formik.errors.verifyCode
                  )}
                  helperText={
                    formik.touched.verifyCode && formik.errors.verifyCode
                  }
                  label="Verification Code"
                  margin="normal"
                  name="verifyCode"
                  onBlur={formik.handleBlur}
                  onChange={(event) => {
                    // Check if the input is a number
                    if (
                      !/^\d+$/.test(event.target.value) &&
                      event.target.value.length > 0
                    ) {
                      return
                    }
                    // Ensure max length is 6
                    if (event.target.value.length > 6) return
                    formik.handleChange(event)
                  }}
                  size="small"
                  // Disable increment and decrement buttons
                  value={formik.values.verifyCode}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.agreeTerms}
                      name="agreeTerms"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  }
                  label={
                    <Typography
                      variant="caption"
                      sx={{
                        userSelect: 'none',
                      }}
                      color={theme.palette.text.secondary}
                    >
                      I agree to the{' '}
                      <a
                        href={routes.termsOfService()}
                        target="_blank"
                        rel="noreferrer"
                      >
                        terms of service
                      </a>{' '}
                      and agree to receive essential emails regarding my
                      account.
                    </Typography>
                  }
                />
                {formik.errors.agreeTerms && formik.touched.agreeTerms && (
                  <FormHelperText error>
                    {formik.errors.agreeTerms}
                  </FormHelperText>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.emailMarketing}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      name="emailMarketing"
                    />
                  }
                  label={
                    <Typography
                      variant="caption"
                      sx={{
                        userSelect: 'none',
                      }}
                      color={theme.palette.text.secondary}
                    >
                      Receive news and updates about APITeam via email
                      (optional)
                    </Typography>
                  }
                />
                {formik.errors.submit && (
                  <FormHelperText error>{formik.errors.submit}</FormHelperText>
                )}
                <Stack direction="row" spacing={2}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={formik.isSubmitting || !formik.isValid}
                  >
                    Sign Up
                  </Button>
                </Stack>
              </Stack>
            </StepContent>
          </Step>
        </Stepper>
      </form>
    </>
  )
}

export default PasswordSignupForm
