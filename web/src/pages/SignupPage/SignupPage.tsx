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

import PasswordSignupForm from './PasswordSignupForm'

const SignupPage = () => {
  const theme = useTheme()

  return (
    <>
      <MetaTags title="Signup" />
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
                <Link
                  to={routes.root()}
                  style={{
                    textDecoration: 'none',
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
                <Box sx={{ mt: 4 }} />
                <Typography variant="h5">Signup</Typography>
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  mt: 3,
                }}
              >
                <PasswordSignupForm />
              </Box>
              <Divider sx={{ my: 3 }} />
              <Link
                to={routes.login()}
                style={{
                  textDecoration: 'none',
                  color: theme.palette.text.secondary,
                }}
              >
                <Typography variant="body2">Login</Typography>
              </Link>
            </Card>
          </Container>
        </Box>
      </main>
    </>
  )
}

export default SignupPage
