import { useEffect, useRef, useState } from 'react'

import {
  Alert,
  Snackbar,
  Button,
  Card,
  Box,
  Divider,
  Container,
  Typography,
  FormHelperText,
  Stack,
  TextField,
  useTheme,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { useAuth } from '@redwoodjs/auth'
import { navigate, routes, Link } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

type ResetPasswordFormProps = {
  resetToken: string
}

const ResetPasswordPage = ({ resetToken }: ResetPasswordFormProps) => {
  const { isAuthenticated, reauthenticate, validateResetToken, resetPassword } =
    useAuth()
  const [enabled, setEnabled] = useState(false)

  const theme = useTheme()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.dashboard())
    }
  }, [])

  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )

  useEffect(() => {
    const validateToken = async () => {
      const response = await validateResetToken(resetToken)
      console.log(response)
      if (response.error) {
        setEnabled(false)
        setSnackErrorMessage(
          'That reset link is invalid, please request another reset link'
        )
      } else {
        setEnabled(true)
      }
    }
    validateToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formik = useFormik({
    initialValues: {
      password: '',
      passwordConfirmation: '',
      submit: null,
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(8, 'Must be at least 8 characters')
        .max(255)
        .required('Password is required'),
      passwordConfirmation: Yup.string().oneOf(
        [Yup.ref('password'), null],
        'Passwords must match'
      ),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      const response = await resetPassword({
        resetToken,
        password: values.password,
      })
      console.log(response)

      if (response.error) {
        helpers.setStatus({ success: false })
        helpers.setErrors({ submit: response.error })
        return
      }

      setSnackSuccessMessage(
        'Password reset, you shall be redirected momentarily'
      )

      setTimeout(async () => {
        await reauthenticate()
        navigate(routes.login())
      }, 2000)
    },
  })

  return (
    <>
      <Snackbar
        open={!!snackSuccessMessage}
        onClose={() => setSnackSuccessMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackSuccessMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!snackErrorMessage}
        onClose={() => setSnackSuccessMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackErrorMessage}
        </Alert>
      </Snackbar>
      <MetaTags title="Reset Password" />
      <main>
        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Container
            maxWidth="sm"
            sx={{
              p: 4,
            }}
          >
            <Card elevation={16} sx={{ p: 4 }}>
              <Stack spacing={4}>
                <Link
                  to={routes.splash()}
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <Typography
                    fontSize={22}
                    fontWeight={1000}
                    color={theme.palette.text.primary}
                    sx={{ textAlign: 'center' }}
                  >
                    API Team
                  </Typography>
                </Link>
                <Typography variant="h5" sx={{ textAlign: 'center' }}>
                  Reset Password
                </Typography>
                <form noValidate onSubmit={formik.handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="Password"
                      type="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      error={Boolean(
                        formik.touched.password && formik.errors.password
                      )}
                      helperText={
                        formik.touched.password && formik.errors.password
                      }
                      disabled={!enabled}
                    />
                    <TextField
                      fullWidth
                      id="passwordConfirmation"
                      name="passwordConfirmation"
                      label="Confirm Password"
                      type="password"
                      value={formik.values.passwordConfirmation}
                      onChange={formik.handleChange}
                      error={Boolean(
                        formik.touched.passwordConfirmation &&
                          formik.errors.passwordConfirmation
                      )}
                      helperText={
                        formik.touched.passwordConfirmation &&
                        formik.errors.passwordConfirmation
                      }
                      disabled={!enabled}
                    />
                    <Button
                      disabled={formik.isSubmitting || !enabled}
                      size="large"
                      type="submit"
                      variant="contained"
                    >
                      Submit
                    </Button>
                  </Stack>
                </form>
                <Divider />
                <Stack spacing={2}>
                  <Link
                    to={routes.login()}
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body2">
                      Remembered your password?
                    </Typography>
                  </Link>
                  <Link
                    to={routes.forgotPassword()}
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body2">
                      Get a new reset link
                    </Typography>
                  </Link>
                </Stack>
              </Stack>
            </Card>
          </Container>
        </Box>
      </main>
    </>
  )
}

export default ResetPasswordPage
