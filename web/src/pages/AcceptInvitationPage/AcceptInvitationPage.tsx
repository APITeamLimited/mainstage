import { useMemo, useState } from 'react'

import { InvitationDecodedToken } from '@apiteam/types'
import { useMutation, useQuery } from '@apollo/client'
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
import jwt_decode from 'jwt-decode'
import {
  AcceptTeamInvitation,
  AcceptTeamInvitationVariables,
  GetCurrentUser,
} from 'types/graphql'

import { useAuth } from '@redwoodjs/auth'
import { Link, navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

type AcceptInvitationPageProps = {
  token: string
}

const ACCEPT_TEAM_INVITATION = gql`
  mutation AcceptTeamInvitation($token: String!) {
    acceptInvitation(token: $token)
  }
`

const CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    currentUser {
      id
      firstName
      lastName
      email
      profilePicture
    }
  }
`

const AcceptInvitationPage = ({ token }: AcceptInvitationPageProps) => {
  const theme = useTheme()
  const { isAuthenticated } = useAuth()
  const { data: currentUserData } = useQuery<GetCurrentUser>(
    CURRENT_USER_QUERY,
    {
      skip: !isAuthenticated,
    }
  )

  const [acceptInvitation] = useMutation<
    AcceptTeamInvitation,
    AcceptTeamInvitationVariables
  >(ACCEPT_TEAM_INVITATION)

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )
  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  const decodedToken = useMemo(() => {
    try {
      return jwt_decode(token) as unknown as InvitationDecodedToken
    } catch (e) {
      return null
    }
  }, [token])

  return (
    <>
      <MetaTags title="Accept Invitation" />
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
                  Accept Invitation
                </Typography>
                {decodedToken ? (
                  isAuthenticated ? (
                    currentUserData?.currentUser?.email ===
                    decodedToken.invitationEmail ? (
                      <>
                        <Typography
                          variant="body1"
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          Confirm join of {decodedToken.teamName}?
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={async () => {
                            try {
                              const result = await acceptInvitation({
                                variables: {
                                  token,
                                },
                              })

                              if (result.data?.acceptInvitation) {
                                setSnackSuccessMessage(
                                  "You've joined the team! Redirecting shortly..."
                                )
                                setTimeout(() => {
                                  if (!result.data?.acceptInvitation) {
                                    throw new Error(
                                      'Something went wrong. Should have a workspaceId'
                                    )
                                  }

                                  navigate(
                                    routes.dashboard({
                                      requestedWorkspaceId:
                                        result.data.acceptInvitation,
                                    })
                                  )
                                }, 3000)
                              } else {
                                setSnackErrorMessage(
                                  'Something went wrong while accepting the invitation'
                                )
                              }
                            } catch (e) {
                              setSnackErrorMessage(
                                'Something went wrong while accepting the invitation'
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
                        Your account does not have the email address associated
                        with this invitation.
                        {currentUserData?.currentUser?.email}{' '}
                        {decodedToken.invitationEmail}
                      </Typography>
                    )
                  ) : (
                    <>
                      <Typography
                        variant="body1"
                        sx={{
                          textAlign: 'center',
                        }}
                      >
                        You must be logged in to accept an invitation
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          justifyContent: 'center',
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            navigate(
                              routes.login({
                                redirectTo: routes.acceptInvitation({ token }),
                              })
                            )
                          }}
                        >
                          Login
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => {
                            navigate(
                              routes.signup({
                                redirectTo: routes.acceptInvitation({ token }),
                              })
                            )
                          }}
                        >
                          Signup
                        </Button>
                      </Stack>
                    </>
                  )
                ) : (
                  <Typography
                    variant="body1"
                    sx={{
                      textAlign: 'center',
                    }}
                    color={theme.palette.error.main}
                  >
                    Invalid invitation token
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

export default AcceptInvitationPage
