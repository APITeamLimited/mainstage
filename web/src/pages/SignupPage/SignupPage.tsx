import { useMemo } from 'react'

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

import { APITeamLogo } from 'src/components/APITeamLogo'

import { PasswordSignupForm } from './PasswordSignupForm'

type SignupPageProps = {
  redirectTo?: string
  suggestedEmail?: string
}

const SignupPage = ({ redirectTo, suggestedEmail }: SignupPageProps) => {
  const theme = useTheme()

  const toLoginLinks = useMemo(() => {
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
                <APITeamLogo alignSelf="center" />
                <Typography variant="h5" sx={{ textAlign: 'center' }}>
                  Signup
                </Typography>
                <PasswordSignupForm suggestedEmail={suggestedEmail} />
                <Divider />
                <Link
                  to={routes.login(toLoginLinks)}
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
