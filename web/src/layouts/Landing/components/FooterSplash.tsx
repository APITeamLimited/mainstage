import { LINKS } from '@apiteam/types/src'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import {
  Container,
  Grid,
  Stack,
  Typography,
  Box,
  useTheme,
  Divider,
  useMediaQuery,
  SvgIcon,
  Tooltip,
} from '@mui/material'

import { Link } from '@redwoodjs/router'

import { APITeamLogo } from 'src/components/APITeamLogo'
import { brandedRoutes } from 'src/Routes'
import { ThemeInverter } from 'src/utils/ThemeInverter'

export const FOOTER_SPASH_HEIGHT = {
  xs: '950px',
  md: '500px',
}

const socialLinks = [
  {
    name: 'GitHub',
    actionMessage: 'Check us out on GitHub',
    href: LINKS.gitHub,
    icon: GitHubIcon,
  },
  {
    name: 'LinkedIn',
    actionMessage: 'Connect with us on LinkedIn',
    href: LINKS.linkedIn,
    icon: LinkedInIcon,
  },
]

type FooterSplashProps = {
  transparent?: boolean
}

export const FooterSplash = (props: FooterSplashProps) => (
  // <ThemeInverter>
  <FooterSplashInner {...props} />
  //</ThemeInverter>
)

const FooterSplashInner = ({ transparent }: FooterSplashProps) => {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          backgroundColor: transparent
            ? undefined
            : theme.palette.alternate.dark,
          // background: `radial-gradient(circle at 50% 50%,${alpha(
          //   theme.palette.primary.main,
          //   0.1
          // )}, ${alpha(theme.palette.primary.light, 0.0)})`,
          position: 'absolute',
          bottom: 0,
          height: {
            xs: FOOTER_SPASH_HEIGHT.xs,
            md: FOOTER_SPASH_HEIGHT.md,
          },
          maxHeight: {
            xs: FOOTER_SPASH_HEIGHT.xs,
            md: FOOTER_SPASH_HEIGHT.md,
          },
        }}
      >
        <Stack
          sx={{
            height: '100%',
          }}
        >
          <Divider />
          <Container
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              paddingX: 6,
              paddingY: 12,
            }}
          >
            <Stack
              sx={{
                width: '100%',
              }}
              justifyContent="center"
              alignItems="flex-start"
            >
              <Stack
                direction={isSmall ? 'column' : 'row'}
                spacing={6}
                sx={{
                  width: '100%',
                  marginBottom: 6,
                }}
                alignItems="center"
                justifyContent={isSmall ? 'flex-start' : 'space-between'}
              >
                <APITeamLogo disableLinks height="50px" />
                <Stack direction="row" spacing={2}>
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Tooltip title={link.actionMessage}>
                        <SvgIcon
                          component={link.icon}
                          fontSize="large"
                          sx={{
                            color: theme.palette.text.primary,
                          }}
                        />
                      </Tooltip>
                    </a>
                  ))}
                </Stack>
              </Stack>
              <Divider flexItem sx={{ marginBottom: 6 }} />
              <Grid
                container
                justifyContent={isSmall ? 'center' : 'flex-start'}
                alignItems="baseline"
              >
                {brandedRoutes.map((route, index) => (
                  <Grid
                    item
                    key={index}
                    alignItems="center"
                    sx={{
                      marginRight: isSmall ? 0 : 12,
                      marginBottom: 6,
                    }}
                    // Only trigger strict spacing on small screens
                    xs={isSmall ? 12 : undefined}
                  >
                    <Stack spacing={4}>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          color: theme.palette.text.primary,
                        }}
                        variant="h6"
                      >
                        {route.name}
                      </Typography>
                      <Stack spacing={2}>
                        {route.sublinks.map(
                          (
                            subLink: { name: string; path: string },
                            indexLink: number
                          ) => {
                            return (
                              <Typography key={indexLink} variant="body2">
                                <Link
                                  key={indexLink}
                                  to={subLink.path}
                                  style={{
                                    textDecoration: 'none',
                                    color: theme.palette.text.primary,
                                  }}
                                >
                                  {subLink.name}
                                </Link>
                              </Typography>
                            )
                          }
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
              <Divider flexItem sx={{ marginBottom: 6 }} />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                }}
              >
                © {new Date().getFullYear()} APITeam Limited. Registered in
                England and Wales, Company No. 13429411
              </Typography>
            </Stack>
          </Container>
        </Stack>
      </Box>
    </div>
  )
}
