import React, { useState } from 'react'

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import SvgIcon from '@mui/icons-material/ArrowForwardIos'
import { Stack } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import { useTheme } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

import { Link, routes } from '@redwoodjs/router'

const mock = [
  {
    title: 'Free',
    subtitle: 'For teams and single developers',
    price: { monthly: '£0', annual: '£0' },
    features: ['1 User', '1 App', 'Integrations'],
    callToAction: {
      text: 'Sign Up',
      path: '/signup',
    },
  },
  {
    title: 'Pro',
    subtitle: 'For teams and advanced developers',
    price: { monthly: '£44', annual: '£390' },
    features: [
      'All in Starter plan',
      'Google Ads',
      'SSO via Google',
      'API access',
    ],
    callToAction: {
      text: 'Sign Up',
      path: '/pricing',
    },
  },
  {
    title: 'Enterprise',
    subtitle: 'Additional compliance features and large scale load testing',
    price: { monthly: '£77', annual: '£690' },
    features: [
      'All features',
      'Email support',
      'Google Ads',
      'SSO via Google',
      'API access',
      'Facebook Ads',
    ],
    callToAction: {
      text: 'Sign Up',
      path: '/pricing',
    },
  },
]

const WithOptionTogglerButton = (): JSX.Element => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true,
  })

  const [pricingOption, setPricingOption] = useState('annual')

  const handleClick = (event, newPricingOption): void => {
    setPricingOption(newPricingOption)
  }

  const renderToggler = () => (
    <Box display={'flex'} justifyContent={'center'} marginBottom={4}>
      <ToggleButtonGroup value={pricingOption} exclusive onChange={handleClick}>
        <ToggleButton
          value="annual"
          size={isMd ? 'large' : 'small'}
          sx={{
            backgroundColor:
              pricingOption === 'annual'
                ? `£{theme.palette.primary.light} !important`
                : 'transparent',
            border: `1px solid £{theme.palette.primary.main}`,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color:
                pricingOption === 'annual' ? 'common.white' : 'text.primary',
            }}
          >
            Annual
          </Typography>
        </ToggleButton>
        <ToggleButton
          value="monthly"
          size={isMd ? 'large' : 'small'}
          sx={{
            backgroundColor:
              pricingOption === 'monthly'
                ? `£{theme.palette.primary.light} !important`
                : 'transparent',
            border: `1px solid £{theme.palette.primary.main}`,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color:
                pricingOption !== 'annual' ? 'common.white' : 'text.primary',
            }}
          >
            Monthly
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.alternate.main,
        backgroundImage: `linear-gradient(120deg, £{theme.palette.background.paper} 0%, £{theme.palette.alternate.dark} 100%)`,
        paddingBottom: 4,
      }}
    >
      <Box
        sx={{
          position: 'relative',
        }}
      >
        <Box
          component={'svg'}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          x="0px"
          y="0px"
          viewBox="0 0 1920 100.1"
          sx={{
            width: '100%',
            marginBottom: 10,
            // Rotate 180 degrees
            transform: 'rotate(180deg)',
          }}
        >
          <path
            fill={theme.palette.background.paper}
            d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z"
          ></path>
        </Box>
        <Container
          sx={{
            paddingBottom: 2,
          }}
        >
          <Box>
            <Box marginBottom={4}>
              <Typography
                variant="h3"
                gutterBottom
                align={'center'}
                sx={{
                  fontWeight: 900,
                }}
              >
                Pricing
              </Typography>
              <Typography
                variant="h6"
                component="p"
                color="text.primary"
                align={'center'}
              >
                Get great features for less with no pay per user pricing
              </Typography>
            </Box>
            {renderToggler()}
          </Box>
        </Container>
      </Box>
      <Container>
        <Grid container spacing={4}>
          {mock.map((item, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Box
                component={Card}
                height={1}
                display={'flex'}
                flexDirection={'column'}
              >
                <CardContent
                  sx={{
                    padding: 4,
                  }}
                >
                  <Box marginBottom={2}>
                    <Typography variant={'h4'} fontWeight={600} gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography color={'text.secondary'}>
                      {item.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    display={'flex'}
                    alignItems={'baseline'}
                    marginBottom={2}
                  >
                    <Typography variant={'h3'} fontWeight={700}>
                      {pricingOption === 'annual'
                        ? item.price.annual
                        : item.price.monthly}
                    </Typography>
                    <Typography
                      variant={'subtitle1'}
                      color={'text.secondary'}
                      fontWeight={700}
                    >
                      {pricingOption === 'annual' ? '/y' : '/mo'}
                    </Typography>
                  </Box>
                  <Grid container spacing={1}>
                    {item.features.map((feature, j) => (
                      <Grid item xs={12} key={j}>
                        <Box
                          component={ListItem}
                          disableGutters
                          width={'auto'}
                          padding={0}
                        >
                          <Box
                            component={ListItemAvatar}
                            minWidth={'auto !important'}
                            marginRight={2}
                          >
                            <Box
                              component={Avatar}
                              bgcolor={theme.palette.primary.main}
                              width={20}
                              height={20}
                            >
                              <svg
                                width={12}
                                height={12}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </Box>
                          </Box>
                          <ListItemText primary={feature} />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
                <Box flexGrow={1} />
                <CardActions sx={{ justifyContent: 'flex-end', padding: 4 }}>
                  <Link
                    to={item.callToAction.path}
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                    <Button
                      size={'large'}
                      variant={'contained'}
                      sx={{
                        textDecoration: 'none',
                      }}
                    >
                      {item.callToAction.text}
                    </Button>
                  </Link>
                </CardActions>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Link
          to={routes.pricing()}
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            <Typography
              variant="h6"
              component="p"
              color="text.primary"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              Full pricing and add-ons
            </Typography>
            <SvgIcon component={ArrowForwardIosIcon} />
          </Stack>
        </Link>
      </Container>
    </Box>
  )
}

export default WithOptionTogglerButton
