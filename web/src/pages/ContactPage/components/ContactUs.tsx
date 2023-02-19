import { ROUTES } from '@apiteam/types'
import {
  Stack,
  Typography,
  Box,
  ListItemText,
  ListItemAvatar,
  ListItem,
  Avatar,
  useTheme,
  Link,
  useMediaQuery,
} from '@mui/material'

import { ActionCard } from 'src/layouts/Landing/components/ActionCard'
import {
  largePanelSpacing,
  smallPanelSpacing,
} from 'src/layouts/Landing/components/constants'

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

  const isMd = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <Stack spacing={largePanelSpacing}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Reach Us
      </Typography>
      <Stack spacing={largePanelSpacing} direction={isMd ? 'row' : 'column'}>
        <Stack spacing={smallPanelSpacing}>
          <Typography
            variant="h4"
            color={theme.palette.text.primary}
            fontWeight="bold"
          >
            Support
          </Typography>
          <Typography variant="h6" color={theme.palette.text.secondary}>
            Feel free to reach out to us if you have any questions via email
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
                <Link
                  href="mailto:support@apiteam.cloud"
                  sx={{
                    textDecoration: 'none',
                  }}
                >
                  support@apiteam.cloud
                </Link>
              }
              primaryTypographyProps={{
                variant: 'h6',
                color: theme.palette.text.secondary,
              }}
            />
          </ListItem>
          {/* <ActionCard
            title="Why not try our support center?"
            description="Our support center is a great place to find answers to your questions"
            buttonText="Support Center"
            buttonLink={ROUTES.support}
            backgroundColor={theme.palette.primary.main}
            invertFontColor
          /> */}
        </Stack>
        <Stack spacing={smallPanelSpacing}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color={theme.palette.text.primary}
          >
            General Queries
          </Typography>
          <Typography variant="h6" color={theme.palette.text.secondary}>
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
                <Link
                  href="mailto:info@apiteam.cloud"
                  sx={{
                    textDecoration: 'none',
                  }}
                >
                  info@apiteam.cloud
                </Link>
              }
              primaryTypographyProps={{
                variant: 'h6',
                color: theme.palette.text.secondary,
              }}
            />
          </ListItem>
        </Stack>
      </Stack>
    </Stack>
  )
}
