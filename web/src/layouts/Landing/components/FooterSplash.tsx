import {
  Container,
  Grid,
  Stack,
  Typography,
  Box,
  useTheme,
  Divider,
  useMediaQuery,
  Theme,
} from '@mui/material'

import { Link } from '@redwoodjs/router'

import { brandedRoutes } from 'src/Routes'

export const FOOTER_SPASH_HEIGHT = {
  xs: '600px',
  md: '500px',
}

const LogoBanners = () => {
  const theme = useTheme()

  return (
    <Grid item key={-1} alignSelf="center">
      <Typography
        fontSize={22}
        fontWeight={1000}
        color={theme.palette.text.primary}
        sx={{
          userSelect: 'none',
        }}
      >
        API Team
      </Typography>
    </Grid>
  )
}

export const FooterSplash = () => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: theme.palette.alternate.dark,
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
            backgroundColor: theme.palette.alternate.dark,
            alignItems: 'center',
            height: '100%',
            padding: 4,
          }}
        >
          <Stack
            justifyContent={{
              md: 'space-between',
              xs: 'space-evenly',
            }}
            spacing={4}
            sx={{
              height: '100%',
            }}
          >
            {isMd && <LogoBanners />}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'center',
              }}
            >
              <Grid
                container
                spacing={{
                  xs: 4,
                  md: 10,
                }}
                justifyContent="center"
              >
                {!isMd && <LogoBanners />}
                {brandedRoutes.map((route, index) => (
                  <Grid item key={index} alignItems="center">
                    <Stack spacing={1}>
                      <Typography
                        sx={{
                          paddingBottom: 1,
                          fontWeight: 'bold',
                          color: theme.palette.text.primary,
                        }}
                      >
                        {route.name}
                      </Typography>
                      {route.sublinks.map(
                        (
                          subLink: { name: string; path: string },
                          indexLink: number
                        ) => {
                          return (
                            <Typography key={indexLink}>
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
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                color: theme.palette.text.secondary,
              }}
            >
              © {new Date().getFullYear()} APITeam. APITeam is a limited company
              registered in England and Wales, Company Number 13429411
            </Typography>
          </Stack>
        </Container>
      </Stack>
    </Box>
  )
}
