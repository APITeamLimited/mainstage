import {
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
  pricingRef?: React.RefObject<HTMLDivElement>
}

const TypedIntro = ({ pricingRef }: TypedIntroProps): JSX.Element => {
  const theme = useTheme()

  return (
    <Container
      sx={{
        overflow: 'hidden',
        paddingBottom: '15vh',
      }}
    >
      <Stack
        alignItems="baseline"
        sx={{
          minHeight: '80vh',
          justifyContent: 'center',
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
            APITeam is an all in one platform for designing, testing and scaling
            APIs collaboratively
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
                  pricingRef?.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
                variant="outlined"
                color="secondary"
                size="large"
              >
                See Pricing
              </Button>
            </div>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}

export default TypedIntro
