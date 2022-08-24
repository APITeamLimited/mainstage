/* eslint-disable react/no-unescaped-entities */
import React from 'react'

import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings'
import SvgIcon from '@mui/icons-material/DisplaySettings'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import SecurityIcon from '@mui/icons-material/Security'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { alpha, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

const features = [
  {
    title: 'Access Control',
    subtitle: 'Control who can access your published API',
    icon: SecurityIcon,
  },
  {
    title: 'Completely Customisable',
    subtitle:
      'Customise the look and feel of your documentation to match your brand',
    icon: DisplaySettingsIcon,
  },
  {
    title: 'Usage Insights',
    subtitle:
      "See usage statistics of your published APIs and how they're used",
    icon: PersonSearchIcon,
  },
]

const PublishOverview = (): JSX.Element => {
  const theme = useTheme()
  return (
    <Container
      sx={{
        marginY: 20,
      }}
    >
      <Box>
        <Box marginBottom={4}>
          <Box marginBottom={2}>
            <Typography
              variant="h4"
              color={theme.palette.text.primary}
              align={'center'}
              gutterBottom
              sx={{
                fontWeight: 700,
              }}
            >
              Publish your APIs to your own domain
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color={theme.palette.text.secondary}
              sx={{ fontWeight: 400 }}
              align={'center'}
            >
              Instantly publish beautiful documentation to your domain for free,
              hosted by us
            </Typography>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {features.map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box width={1} height={1}>
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  alignItems={'center'}
                >
                  <Box
                    component={Avatar}
                    width={60}
                    height={60}
                    marginBottom={2}
                    bgcolor={alpha(theme.palette.primary.main, 0.1)}
                    color={theme.palette.primary.main}
                  >
                    <SvgIcon component={item.icon} />
                  </Box>
                  <Typography
                    variant={'h6'}
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                    align={'center'}
                    color={theme.palette.text.primary}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    align={'center'}
                    color={theme.palette.text.secondary}
                  >
                    {item.subtitle}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  )
}

export default PublishOverview
