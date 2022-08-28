import {
  Stack,
  Typography,
  Box,
  ListItemText,
  ListItemAvatar,
  ListItem,
  Avatar,
  useTheme,
  Button,
  Link,
  Paper,
} from '@mui/material'

import { Link as RouterLink, routes } from '@redwoodjs/router'

const emailIcon = (
  <svg
    width={20}
    height={20}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
  </svg>
)

export const ContactUs = () => {
  const theme = useTheme()

  return (
    <>
      <Stack spacing={6} marginY={6}>
        <Typography variant="h4">Reach Us</Typography>
        <Stack
          direction={{
            xs: 'column',
            sm: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
          spacing={4}
        >
          <Stack spacing={2}>
            <Typography
              variant="h6"
              color={theme.palette.text.primary}
              fontWeight="bold"
            >
              Support
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              Feel free to reach out to us if you have any questions or concerns
              via email
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              Alternatively, you can reach out to us via our support channels,
              or in our support center
            </Typography>
            <ListItem>
              <Box
                component={ListItemAvatar}
                minWidth="auto !important"
                marginRight={2}
              >
                <Box
                  component={Avatar}
                  bgcolor={theme.palette.secondary.main}
                  width={40}
                  height={40}
                >
                  {emailIcon}
                </Box>
              </Box>
              <ListItemText
                primary={
                  <Link href="mailto://support@apiteam.cloud">
                    support@apiteam.cloud
                  </Link>
                }
              />
            </ListItem>
            <Paper
              sx={{
                backgroundColor: theme.palette.primary.main,
              }}
            >
              <Stack margin={2} spacing={2} alignItems="center">
                <Typography
                  variant="h6"
                  color={theme.palette.common.white}
                  align="center"
                >
                  Why not try our support center?
                </Typography>
                <RouterLink
                  to={routes.supportCenter()}
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{
                      color: theme.palette.common.white,
                      borderColor: theme.palette.common.white,
                    }}
                  >
                    Support Center
                  </Button>
                </RouterLink>
              </Stack>
            </Paper>
          </Stack>
          <Stack spacing={2}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={theme.palette.text.primary}
            >
              General Queries
            </Typography>
            <Typography variant="body1" color={theme.palette.text.secondary}>
              Feel free to reach out to us for anything else at this email
            </Typography>
            <ListItem>
              <Box
                component={ListItemAvatar}
                minWidth="auto !important"
                marginRight={2}
              >
                <Box
                  component={Avatar}
                  bgcolor={theme.palette.secondary.main}
                  width={40}
                  height={40}
                >
                  {emailIcon}
                </Box>
              </Box>
              <ListItemText
                primary={
                  <Link href="mailto://info@apiteam.cloud">
                    info@apiteam.cloud
                  </Link>
                }
              />
            </ListItem>
          </Stack>
        </Stack>
      </Stack>
    </>
  )
}
