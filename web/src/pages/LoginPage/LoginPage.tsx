import {
  Box,
  Card,
  Container,
  Divider,
  Typography,
  useTheme,
} from '@mui/material'

import { Link, routes } from '@redwoodjs/router'

import PasswordLoginForm from './PasswordLoginForm'

const LoginPage = () => {
  const theme = useTheme()
  return (
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
            <Typography variant="h5">Login</Typography>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              mt: 3,
            }}
          >
            <PasswordLoginForm />
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
              to={routes.forgotPassword()}
              style={{
                textDecoration: 'none',
                color: theme.palette.text.secondary,
              }}
            >
              <Typography variant="body2">Forgot Password?</Typography>
            </Link>
          </Box>
        </Card>
      </Container>
    </Box>
  )
}

export default LoginPage
