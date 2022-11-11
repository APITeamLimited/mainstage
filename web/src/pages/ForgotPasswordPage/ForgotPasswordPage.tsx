import {
  Box,
  Card,
  Container,
  Divider,
  Typography,
  useTheme,
  Stack,
} from '@mui/material'

import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { APITeamLogo } from 'src/components/APITeamLogo'

import ForgotPasswordForm from './ForgotPasswordForm'

const ForgotPasswordPage = () => {
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
                <APITeamLogo alignSelf="center" />
                <Typography variant="h5" sx={{ textAlign: 'center' }}>
                  Reset Password
                </Typography>
                <ForgotPasswordForm />
                <Divider />
                <Stack spacing={2}>
                  <Link
                    to={routes.signup()}
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body2">Create Account</Typography>
                  </Link>
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
                </Stack>
              </Stack>
            </Card>
          </Container>
        </Box>
      </main>
    </>
  )
}

export default ForgotPasswordPage
