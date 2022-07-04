import React from 'react'

import InsightsIcon from '@mui/icons-material/Insights'
import LandscapeIcon from '@mui/icons-material/Landscape'
import PublicIcon from '@mui/icons-material/Public'
import SvgIcon from '@mui/icons-material/Public'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

const features = [
  {
    title: 'Multi-Region Support',
    subtitle:
      'Each load test is orchestrated globally from multiple servers in the APITeam Cloud, enabling geographic insights into your load test results.',
    icon: PublicIcon,
  },
  {
    title: 'K6 Compatible',
    subtitle:
      'Globetest is bult upon K6, the most popular load testing tool. Import existing tests and run them instantly',
    icon: LandscapeIcon,
  },
  {
    title: 'Unparalleled Insights',
    subtitle:
      'Easily determine problems with your system at load, get detailed inisghts down to the level of individual requests, easily export your data to use with your own tools, and more',
    icon: InsightsIcon,
  },
]

const GlobeTestOverview = (): JSX.Element => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  })

  return (
    <Container
      sx={{
        marginY: 20,
      }}
    >
      <Grid container spacing={4} direction={isMd ? 'row' : 'column-reverse'}>
        <Grid item container justifyContent={'center'} xs={12} md={6}>
          <Box
            height={1}
            width={1}
            maxWidth={500}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component={'img'}
              src={
                'https://i.pinimg.com/originals/aa/1b/74/aa1b7479fbd5f7b936adb4e39d977a6c.gif'
              }
              width={0.8}
              height={0.8}
              sx={{
                filter:
                  theme.palette.mode === 'dark' ? 'brightness(0.8)' : 'none',
              }}
            />
          </Box>
        </Grid>
        <Grid item container alignItems={'center'} xs={12} md={6}>
          <Box>
            <Box marginBottom={4}>
              <Typography variant={'h4'} gutterBottom sx={{ fontWeight: 700 }}>
                <Typography color="primary" variant="inherit" component="span">
                  Load test
                </Typography>{' '}
                your APIs globally with a single click
              </Typography>
              <Typography component={'p'} color={'text.secondary'}>
                Test your API globally using distributed load testing with
                GlobeTest
              </Typography>
            </Box>
            <List disablePadding>
              {features.map((item, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemAvatar>
                    <Box
                      component={Avatar}
                      variant={'rounded'}
                      color={theme.palette.primary.dark}
                      bgcolor={`${theme.palette.primary.light}22`}
                    >
                      <SvgIcon component={item.icon} />
                    </Box>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.title}
                    secondary={item.subtitle}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default GlobeTestOverview
