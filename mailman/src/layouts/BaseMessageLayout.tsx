import React from 'react'

import { Box, Card, Divider, Link, Typography, useTheme } from '@mui/material'
import { Email, Box as EmailBox } from 'react-html-email'

import { checkValue } from '../config'
import { useInput } from '../MailmanProvider'

type BaseMessageLayoutProps = {
  title: string
  children?: React.ReactNode
  messageType: 'MANDATORY' | 'OPTIONAL_PROMOTIONAL' | 'OPTIONAL_TEAM_UPDATES'
}

export const mainSpacing = 4

export const BaseMessageLayout = ({
  title,
  children,
  messageType,
}: BaseMessageLayoutProps) => {
  const theme = useTheme()
  const input = useInput()

  const { to } = input

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
          <Card sx={{ p: mainSpacing, marginBottom: mainSpacing }}>
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
              <Link href="mailto:support@apiteam.cloud">
                support@apiteam.cloud
              </Link>
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
                announcements and new features. You can unsubscribe at any time
                by clicking unsubscribe below:
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
                <Link href="#">Unsubscribe</Link>
              </Typography>
            </>
          )}
          {messageType === 'OPTIONAL_TEAM_UPDATES' && (
            <Typography
              color={theme.palette.text.secondary}
              fontSize={12}
              sx={{
                textAlign: 'left',
                marginBottom: 2,
                marginX: mainSpacing,
              }}
            >
              You have opted in to receive optional email notifications about a
              team you are in. You can change your preferences in your
              team&apos;s settings.
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
            <span>
              APITeam values your privacy, to learn more about how we use your
              data please visit our{' '}
              <Link
                href={`${checkValue<string>('gateway')}/legal/privacy-policy`}
              >
                Privacy Policy
              </Link>
              .
            </span>
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
            © {new Date().getFullYear()} APITeam
          </Typography>
        </Box>
      </EmailBox>
    </Email>
  )
}
