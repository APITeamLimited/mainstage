import { useMemo } from 'react'

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

import { APITeamLogo } from 'src/components/APITeamLogo'

import PasswordLoginForm from './PasswordLoginForm'

type LoginPageProps = {
  redirectTo?: string
  suggestedEmail?: string
}

const LoginPage = ({ redirectTo, suggestedEmail }: LoginPageProps) => {
  const theme = useTheme()

  const toSignupLinks = useMemo(() => {
    let base = {}

    if (redirectTo) {
      base = {
        ...base,
        redirectTo,
      }
    }

    if (suggestedEmail) {
      base = {
        ...base,
        suggestedEmail,
      }
    }

    return base
  }, [redirectTo, suggestedEmail])

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
                <APITeamLogo alignSelf="center" />
                <Typography
                  variant="h5"
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  Login
                </Typography>
                <PasswordLoginForm suggestedEmail={suggestedEmail} />
                <Divider />
                <Stack spacing={2}>
                  <Link
                    to={routes.signup(toSignupLinks)}
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
