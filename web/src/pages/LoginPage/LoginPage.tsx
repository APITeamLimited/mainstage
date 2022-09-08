import {
  Box,
  Stack,
  Card,
  Container,
  Divider,
  Typography,
  useTheme,
} from '@mui/material'

import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import PasswordLoginForm from './PasswordLoginForm'

type LoginPageProps = {
  redirectTo?: string
}

const LoginPage = ({ redirectTo }: LoginPageProps) => {
  const theme = useTheme()

  return (
    <>
      <MetaTags title="Login" />
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
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    fontSize={22}
                    fontWeight={1000}
                    color={theme.palette.text.primary}
                  >
                    API Team
                  </Typography>
                </Link>
                <Typography
                  variant="h5"
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  Login
                </Typography>
                <PasswordLoginForm />
                <Divider />
                <Stack spacing={2}>
                  <Link
                    to={
                      redirectTo
                        ? routes.signup({ redirectTo })
                        : routes.signup()
                    }
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body2">Create account</Typography>
                  </Link>
                  <Link
                    to={routes.forgotPassword()}
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body2">Forgot password?</Typography>
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

export default LoginPage
