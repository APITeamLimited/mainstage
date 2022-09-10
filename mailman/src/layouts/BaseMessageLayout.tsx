import React from 'react'

import { ROUTES } from '@apiteam/types'
import { Box, Card, Divider, Typography, useTheme } from '@mui/material'
import { Email, Box as EmailBox } from 'react-html-email'

import { checkValue } from '../config'
import { useInput } from '../MailmanProvider'

type BaseMessageLayoutProps = {
  title: string
  children?: React.ReactNode
  messageType:
    | 'MANDATORY'
    | 'OPTIONAL_PROMOTIONAL'
    | 'OPTIONAL_TEAM_UPDATES'
    | 'NON_USER_INVITE'
    | 'SIGNUP_CONFIRMATION'
}

export const mainSpacing = 4

export const BaseMessageLayout = ({
  title,
  children,
  messageType,
}: BaseMessageLayoutProps) => {
  const theme = useTheme()
  const input = useInput()

  const { to, userUnsubscribeUrl, blanketUnsubscribeUrl } = input

  return (
    <Email
      bodyStyle={{
        backgroundColor: theme.palette.background.default,
      }}
      title={title}
    >
      <EmailBox>
        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
            padding: mainSpacing,
            maxWidth: 1000,
          }}
        >
          <Typography
            fontSize={22}
            fontWeight={1000}
            color={theme.palette.text.primary}
            sx={{
              textAlign: 'center',
              userSelect: 'none',
              marginBottom: mainSpacing,
            }}
          >
            API Team
          </Typography>
          <Card
            sx={{
              p: mainSpacing,
              marginBottom: mainSpacing,
            }}
          >
            {children}
            <Divider sx={{ marginY: mainSpacing }} />
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
              }}
              color={theme.palette.text.secondary}
            >
              Have a question? Reach out to us at{' '}
              <a href="mailto:support@apiteam.cloud">support@apiteam.cloud</a>
            </Typography>
          </Card>
          <Typography
            color={theme.palette.text.secondary}
            fontSize={12}
            sx={{
              textAlign: 'left',
              marginBottom: 2,
              marginX: mainSpacing,
            }}
          >
            This email was sent to{' '}
            <span style={{ fontWeight: 'bold' }}>{to}</span>
          </Typography>
          {messageType === 'MANDATORY' && (
            <Typography
              color={theme.palette.text.secondary}
              fontSize={12}
              sx={{
                textAlign: 'left',
                marginBottom: 2,
                marginX: mainSpacing,
              }}
            >
              You are receiving this mandatory email to update you about
              important changes or information regarding your APITeam account or
              services.
            </Typography>
          )}
          {messageType === 'OPTIONAL_PROMOTIONAL' && (
            <>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                You have opted in to receive optional emails about APITeam
                announcements and new features. You can manage your email
                preferences at any time by clicking below:
              </Typography>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                <a href={userUnsubscribeUrl || undefined}>Unsubscribe</a>
              </Typography>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                Alternatively, you can unsubscribe from all non-essential emails
                by clicking below:
              </Typography>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                  overflowWrap: 'break-word',
                }}
              >
                <a href={blanketUnsubscribeUrl}>Unsubscribe-All</a>
              </Typography>
            </>
          )}
          {messageType === 'OPTIONAL_TEAM_UPDATES' && (
            <>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                You have opted in to receive optional email notifications about
                a team you are in. You can change your preferences in your
                team&apos;s settings. Alternatively, you can manage your email
                preferences at any time by clicking below:
              </Typography>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                <a href={userUnsubscribeUrl || undefined}>Unsubscribe</a>
              </Typography>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                Alternatively, you can unsubscribe from all non-essential emails
                by clicking below:
              </Typography>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                <a href={blanketUnsubscribeUrl}>Unsubscribe-All</a>
              </Typography>
            </>
          )}
          {messageType === 'NON_USER_INVITE' && (
            <>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                You are receiving this email as someone invited you to join
                APITeam. If you do not wish to receive any further emails from
                APITeam, click below:
              </Typography>
              <Typography
                color={theme.palette.text.secondary}
                fontSize={12}
                sx={{
                  textAlign: 'left',
                  marginBottom: 2,
                  marginX: mainSpacing,
                }}
              >
                <a href={blanketUnsubscribeUrl}>
                  Do not contact me (Unusubscribe)
                </a>
              </Typography>
            </>
          )}
          {messageType === 'SIGNUP_CONFIRMATION' && (
            <Typography
              color={theme.palette.text.secondary}
              fontSize={12}
              sx={{
                textAlign: 'left',
                marginBottom: 2,
                marginX: mainSpacing,
              }}
            >
              You are receiving this email as you signed up for APITeam. If you
              did not sign up for APITeam, please let us know
            </Typography>
          )}
          <Typography
            color={theme.palette.text.secondary}
            fontSize={12}
            sx={{
              textAlign: 'left',
              marginBottom: 2,
              marginX: mainSpacing,
            }}
          >
            APITeam values your privacy, to learn more about how we use your
            data please visit our{' '}
            <a
              href={`${checkValue<string>('gateway.url')}${
                ROUTES.privacyPolicy
              }`}
            >
              Privacy Policy
            </a>
            .
          </Typography>
          <Typography
            color={theme.palette.text.secondary}
            gutterBottom
            fontSize={12}
            sx={{
              textAlign: 'left',
              marginX: mainSpacing,
            }}
          >
            © {new Date().getFullYear()} APITeam.
          </Typography>
        </Box>
      </EmailBox>
    </Email>
  )
}
