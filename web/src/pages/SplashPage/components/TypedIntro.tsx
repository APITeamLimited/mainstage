import {
  Box,
  alpha,
  useTheme,
  Container,
  Stack,
  Typography,
  Button,
} from '@mui/material'
import Typed from 'react-typed'

import { mediumPanelSpacing } from 'src/layouts/Landing/components/constants'
import { SignUpOrContinueButton } from 'src/layouts/Landing/components/SignUpOrContinueButton'

type TypedIntroProps = {
  whyUseAPITeamRef?: React.RefObject<HTMLDivElement>
}

const TypedIntro = ({ whyUseAPITeamRef }: TypedIntroProps): JSX.Element => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        backgroundImage: `linear-gradient(to bottom, ${alpha(
          theme.palette.background.paper,
          0
        )}, ${alpha(theme.palette.alternate.dark, 1)} 100%)`,
        backgroundRepeat: 'repeat-x',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container
        sx={{
          overflow: 'hidden',
        }}
      >
        <Stack
          paddingY={{ xs: '4rem', md: '8rem' }}
          alignItems="baseline"
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            minHeight: '80vh',
          }}
        >
          <Stack
            spacing={mediumPanelSpacing}
            sx={{
              // Overlaps with the preview images
              zIndex: 1,
              maxWidth: '100%',
            }}
          >
            <Typography
              variant="h1"
              color={theme.palette.text.primary}
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                fontSize: { xs: '3.5rem', sm: '5rem' },
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
                  loop
                />
              </Typography>
            </Typography>
            <Typography variant="h5" color={theme.palette.text.secondary}>
              APITeam is an all in one platform for designing, testing and
              scaling APIs collaboratively
            </Typography>
            <Stack
              spacing={mediumPanelSpacing}
              direction={{
                xs: 'column',
                sm: 'row',
              }}
            >
              <SignUpOrContinueButton size="large" />
              <div
                style={{
                  whiteSpace: 'nowrap',
                }}
              >
                <Button
                  // Scroll to the features section
                  onClick={() =>
                    whyUseAPITeamRef?.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    })
                  }
                  variant="outlined"
                  color="secondary"
                  size="large"
                >
                  See Features
                </Button>
              </div>
            </Stack>
          </Stack>
        </Stack>
      </Container>
      <Box
        sx={{
          height: '15vh',
        }}
      />
      <Box
        component="svg"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 1920 100.1"
        sx={{
          width: '100%',
          zIndex: 1,
          marginBottom: -2,
        }}
      >
        <path
          fill={theme.palette.background.paper}
          opacity={1}
          d="M0,0c0,0,934.4,93.4,1920,0v100.1H0L0,0z"
        />
      </Box>
      <Box
        sx={{
          height: '5vh',
          backgroundColor: theme.palette.background.paper,
          zIndex: 1,
        }}
      />
    </Box>
  )
}

export default TypedIntro
