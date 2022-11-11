import { useMemo, useState } from 'react'

import { useMutation } from '@apollo/client'
import {
  Box,
  Stack,
  Card,
  Container,
  Divider,
  Typography,
  useTheme,
  Button,
  Snackbar,
  Alert,
} from '@mui/material'
import jwt_decode, { JwtPayload } from 'jwt-decode'
import {
  HandleAccountDelete,
  HandleAccountDeleteVariables,
} from 'types/graphql'

import { Link, navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { APITeamLogo } from 'src/components/APITeamLogo'

type DeleteAccountPageProps = {
  token: string
}

const HANDLE_ACCOUNT_DELETE_MUTATION = gql`
  mutation HandleAccountDelete($token: String!) {
    handleAccountDelete(token: $token)
  }
`

const DeleteAccountPage = ({ token }: DeleteAccountPageProps) => {
  const theme = useTheme()

  const [handleAccountDelete] = useMutation<
    HandleAccountDelete,
    HandleAccountDeleteVariables
  >(HANDLE_ACCOUNT_DELETE_MUTATION)

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )
  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  const decodedToken = useMemo(() => {
    try {
      const decoded = jwt_decode(token) as unknown as JwtPayload & {
        userId: string
      }

      // Check if the token is expired
      if ((decoded.exp || 0) * 1000 < Date.now()) {
        throw new Error('Token expired')
      }
      return decoded
    } catch (e) {
      return null
    }
  }, [token])

  return (
    <>
      <MetaTags title="Delete Account" />
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
                  Delete Account
                </Typography>
                {decodedToken ? (
                  <>
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: 'center',
                      }}
                    >
                      Confirm deletion of your account
                    </Typography>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={async () => {
                        try {
                          const result = await handleAccountDelete({
                            variables: {
                              token,
                            },
                          })

                          if (result.data?.handleAccountDelete) {
                            setSnackSuccessMessage(
                              'Account deleted successfully'
                            )
                            setTimeout(() => navigate(routes.splash()), 3000)
                          } else {
                            setSnackErrorMessage(
                              'Something went wrong while deleting your account'
                            )
                          }
                        } catch (e) {
                          setSnackErrorMessage(
                            'Something went wrong while deleting your account'
                          )
                        }
                      }}
                      sx={{
                        alignSelf: 'center',
                      }}
                    >
                      Confirm
                    </Button>
                  </>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: 'center',
                    }}
                    color={theme.palette.error.main}
                  >
                    Invalid delete account link, it may have expired, please get
                    a new link from the settings page.
                  </Typography>
                )}
                <Divider />
                <Stack spacing={2}>
                  <Link
                    to={routes.dashboard()}
                    style={{
                      textDecoration: 'none',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography variant="body2">Dashboard</Typography>
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

export default DeleteAccountPage
