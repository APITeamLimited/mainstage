import {
  Container,
  Grid,
  Stack,
  Typography,
  Box,
  ThemeProvider,
  useTheme,
  useMediaQuery,
} from '@mui/material'

import { Link } from '@redwoodjs/router'

import { brandedRoutes } from 'src/Routes'
import getTheme from 'src/theme'

const FooterSplash = () => {
  const theme = useTheme()
  return (
    <ThemeProvider theme={getTheme('dark', () => {})}>
      <Box
        sx={{
          width: '100%',
          backgroundColor: theme.palette.alternate.dark,
        }}
      >
        <Container
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignSelf: 'center',
            backgroundColor: theme.palette.alternate.dark,
            alignItems: 'center',
            paddingY: {
              xs: 2,
              sm: 10,
            },
          }}
        >
          <Stack>
            <Grid
              container
              spacing={{
                xs: 4,
                sm: 10,
              }}
            >
              <Grid item key={-1}>
                <Stack
                  spacing={{
                    xs: 2,
                    sm: 5,
                  }}
                  alignItems="center"
                >
                  <img src="img/api-team.png" alt="APITeam" width="150px" />
                  <img
                    src={
                      'https://www.madeinbritain.co/images/Made-in-Britain-logo-Black-and-White.jpg'
                    }
                    width="100px"
                    alt="Made in Britain"
                  />
                </Stack>
              </Grid>
              {Object.keys(brandedRoutes).map((key, indexCategory) => {
                if (brandedRoutes[key].includeFooter !== false) {
                  return (
                    <Grid item key={indexCategory}>
                      <Stack spacing={1}>
                        <Typography
                          sx={{
                            paddingBottom: 1,
                            fontWeight: 'bold',
                            color: theme.palette.text.primary,
                          }}
                        >
                          {brandedRoutes[key].name}
                        </Typography>
                        {brandedRoutes[key].subLinks.map(
                          (
                            subLink: { name: string; path: string },
                            indexLink: number
                          ) => {
                            return (
                              <Typography key={indexLink}>
                                <Link
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
                  )
                }
              })}
              <Grid item xs={8}></Grid>
            </Grid>
            <Typography
              variant="caption"
              sx={{ textAlign: 'center', color: theme.palette.text.secondary }}
            >
              © {new Date().getFullYear()} APITeam. APITeam is a limited company
              registered in England and Wales company number 13429411
            </Typography>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default FooterSplash
