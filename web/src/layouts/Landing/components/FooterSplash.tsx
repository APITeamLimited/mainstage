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

export const FOOTER_SPASH_HEIGHT = 500

const LogoBanners = () => {
  const theme = useTheme()

  return (
    <Grid item key={-1} alignSelf='center'>
      <Stack
        spacing={{
          xs: 2,
          md: 5,
        }}
        alignItems="center"
      >
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
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_the_United_Kingdom_%28black_and_white%3B_variant_2%29.svg"
          alt="icon"
          width="80px"
        />
      </Stack>
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
        height: FOOTER_SPASH_HEIGHT,
        maxHeight: FOOTER_SPASH_HEIGHT,
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
            padding: 4
          }}
        >
          <Stack
            justifyContent={{
              md: "space-between",
              xs: "space-evenly"
            }}
            sx={{
              height: '100%'
            }}
          >
              {isMd && <LogoBanners />}
              <Box sx={{
                display:'flex',
                alignItems: 'center',
                height: '100%',
                justifyCOntent: 'center'
              }}>
              <Grid
                container
                spacing={{
                  xs: 4,
                  md: 10,
                }}
                justifyContent='center'
              >
                {!isMd && <LogoBanners />}
                {brandedRoutes.map((route, index) => (
                  <Grid item key={index} alignItems='center'>
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
              </Grid></Box>
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
