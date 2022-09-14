/* eslint-disable react/no-unescaped-entities */
import React from 'react'

import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings'
import SvgIcon from '@mui/icons-material/DisplaySettings'
import PersonSearchIcon from '@mui/icons-material/PersonSearch'
import SecurityIcon from '@mui/icons-material/Security'
import { Stack } from '@mui/material'
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

export const PublishOverview = (): JSX.Element => {
  const theme = useTheme()
  return (
    <Container>
      <Stack
        spacing={4}
        sx={{
          paddingY: 20,
        }}
      >
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
        <Grid
          spacing={2}
          sx={{ width: '100%' }}
          container
          alignItems="center"
          justifyContent="center"
        >
          {features.map((item, i) => (
            <Grid
              item
              xs={12}
              sm={4}
              key={i}
              sx={{
                // If first item remove left margin
                '&:first-of-type': {
                  paddingLeft: 0,
                },
              }}
            >
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
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  )
}

export default PublishOverview
