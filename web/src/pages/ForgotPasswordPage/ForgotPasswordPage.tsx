import {
  Box,
  Card,
  Container,
  Divider,
  Typography,
  useTheme,
} from '@mui/material'

import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

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
            height: '100vh',
          }}
        >
          <Container
            maxWidth="sm"
            sx={{
              py: {
                xs: '60px',
                md: '120px',
              },
            }}
          >
            <Card elevation={16} sx={{ p: 4 }}>
              <Box
                sx={{
                  alignItems: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Link to={routes.root()}>
                  <img
                    src="img/api-team.png"
                    style={{
                      width: 150,
                    }}
                    alt="APITeam Logo"
                  />
                </Link>
                <Box sx={{ mt: 4 }} />
                <Typography variant="h5">Reset Password</Typography>
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  mt: 3,
                }}
              >
                <ForgotPasswordForm />
              </Box>
              <Divider sx={{ my: 3 }} />
              <Link
                to={routes.signup()}
                style={{
                  textDecoration: 'none',
                  color: theme.palette.text.secondary,
                }}
              >
                <Typography variant="body2">Create Account</Typography>
              </Link>
              <Box sx={{ mt: 1 }}>
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
              </Box>
            </Card>
          </Container>
        </Box>
      </main>
    </>
  )
}

export default ForgotPasswordPage
