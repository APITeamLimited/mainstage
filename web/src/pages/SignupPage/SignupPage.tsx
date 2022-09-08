import {
  Box,
  Card,
  Stack,
  Container,
  Divider,
  Typography,
  useTheme,
} from '@mui/material'

import { Link, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import PasswordSignupForm from './PasswordSignupForm'

type SignupPageProps = {
  redirectTo?: string
}

const SignupPage = ({ redirectTo }: SignupPageProps) => {
  const theme = useTheme()

  return (
    <>
      <MetaTags title="Signup" />
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
                <Typography variant="h5" sx={{ textAlign: 'center' }}>
                  Signup
                </Typography>
                <PasswordSignupForm />
                <Divider />
                <Link
                  to={
                    redirectTo ? routes.login({ redirectTo }) : routes.login()
                  }
                  style={{
                    textDecoration: 'none',
                    color: theme.palette.text.secondary,
                  }}
                >
                  <Typography variant="body2">Login</Typography>
                </Link>
              </Stack>
            </Card>
          </Container>
        </Box>
      </main>
    </>
  )
}

export default SignupPage
