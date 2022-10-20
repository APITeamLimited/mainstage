import React, { useState } from 'react'

import { Container, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Typed from 'react-typed'

import { SignUpOrContinueButton } from './SignUpOrContinueButton'

const images = [
  {
    light: require('public/img/splash/app-demo-new-light.png'),
    dark: require('public/img/splash/app-demo-new-dark.png'),
  } /*

  Think just one iamge looks better

  {
    light: require('public/img/splash/integrated-load-testing-light.png'),
    dark: require('public/img/splash/integrated-load-testing-dark.png'),
  },
  {
    light: require('public/img/splash/code-generation-light.png'),
    dark: require('public/img/splash/code-generation-dark.png'),
  },*/,
]

const TypedIntro = (): JSX.Element => {
  const theme = useTheme()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(to bottom, ${alpha(
          theme.palette.background.paper,
          0
        )}, ${alpha(theme.palette.alternate.dark, 1)} 100%)`,
        backgroundRepeat: 'repeat-x',
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'hidden',
        marginBottom: 10,
      }}
    >
      <Container>
        <Stack
          paddingY={{ xs: 0, sm: '4rem', md: '8rem' }}
          alignItems="baseline"
          direction="row"
        >
          <Box
            maxWidth={{ xs: 1, sm: '50%' }}
            sx={{
              // Overlaps with the preview images
              zIndex: 1,
            }}
          >
            <Typography
              variant="h1"
              color={theme.palette.text.primary}
              gutterBottom
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              Build APIs
              <br />
              <Typography
                color="primary"
                component="span"
                variant="inherit"
                sx={{
                  background: `linear-gradient(180deg, transparent 82%, ${alpha(
                    theme.palette.secondary.main,
                    0.3
                  )} 0%)`,
                }}
              >
                <Typed
                  strings={[
                    'as a team',
                    'quickly',
                    'with load testing',
                    'that scale',
                  ]}
                  typeSpeed={150}
                  loop={true}
                  preStringTyped={handleNextImage}
                />
              </Typography>
            </Typography>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{ fontWeight: 400 }}
            >
              APITeam is an all in one platform for designing, testing and
              scaling your APIs collaboratively
            </Typography>
            <Stack
              spacing={2}
              marginTop={2}
              direction={{
                xs: 'column',
                sm: 'row',
              }}
            >
              <SignUpOrContinueButton size="large" />
              {/*<Button
                component={'a'}
                href={'/docs/introduction'}
                variant="outlined"
                color="primary"
                size="large"
              >
                See Features
            </Button>*/}
            </Stack>
          </Box>
          {images.map((image, index) => (
            <Box
              sx={{
                display: { xs: 'none', sm: 'block' },
                maxWidth: { xs: 1, sm: '75%' },
                position: 'absolute',
                width: '100%',
                right: 0,
                textAlign: 'right',
                top: '4rem',
                zIndex: 0,
              }}
              key={index}
            >
              <img
                src={theme.palette.mode == 'light' ? image.light : image.dark}
                width="100%"
                alt="Splash demo"
                style={{
                  // Fade to white when src changes
                  transition: 'opacity 0.5s ease-in-out',
                  opacity: currentImageIndex === index ? 0.2 : 0,
                  maxWidth: '1000px',
                }}
              />
            </Box>
          ))}
        </Stack>
      </Container>
      <Box
        sx={{
          height: '15vh',
        }}
      />
      <Box
        component={'svg'}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 1920 100.1"
        sx={{
          width: '100%',
          marginBottom: theme.spacing(-1),
        }}
      >
        <path
          fill={theme.palette.background.paper}
          d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z"
        ></path>
      </Box>
    </Box>
  )
}

export default TypedIntro
