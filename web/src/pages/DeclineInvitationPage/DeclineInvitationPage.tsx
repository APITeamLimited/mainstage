import { useMemo, useState } from 'react'

import { InvitationDecodedToken } from '@apiteam/types/src'
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
import jwt_decode from 'jwt-decode'
import {
  DeclineTeamInvitation,
  DeclineTeamInvitationVariables,
} from 'types/graphql'

import { Link, navigate, routes } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { APITeamLogo } from 'src/components/APITeamLogo'

type DeclineInvitationPageProps = {
  token: string
}

const DECLINE_TEAM_INVITATION = gql`
  mutation DeclineTeamInvitation($token: String!) {
    declineInvitation(token: $token)
  }
`

const DeclineInvitationPage = ({ token }: DeclineInvitationPageProps) => {
  const theme = useTheme()

  const [declineInvitation] = useMutation<
    DeclineTeamInvitation,
    DeclineTeamInvitationVariables
  >(DECLINE_TEAM_INVITATION)

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )
  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  const decodedToken = useMemo(() => {
    try {
      const decoded = jwt_decode(token) as unknown as InvitationDecodedToken
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
      <MetaTags title="Decline Invitation" />
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
                  Decline Invitation
                </Typography>
                {decodedToken ? (
                  <>
                    <Typography
                      variant="body1"
                      sx={{
                        textAlign: 'center',
                      }}
                    >
                      Confirm decline of {decodedToken.teamName}?
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={async () => {
                        try {
                          const result = await declineInvitation({
                            variables: {
                              token,
                            },
                          })

                          if (result.data?.declineInvitation) {
                            setSnackSuccessMessage(
                              "You've successfully declined the invitation"
                            )
                            setTimeout(() => {
                              if (!result.data?.declineInvitation) {
                                throw new Error(
                                  'Something went wrong. Should have a workspaceId'
                                )
                              }

                              navigate(
                                routes.dashboard({
                                  requestedWorkspaceId:
                                    result.data.declineInvitation,
                                })
                              )
                            }, 3000)
                          } else {
                            setSnackErrorMessage(
                              'Something went wrong while declining the invitation'
                            )
                          }
                        } catch (e) {
                          setSnackErrorMessage(
                            'Something went wrong while declining the invitation'
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

export default DeclineInvitationPage
