import { ROUTES } from '@apiteam/types/src'
import { alpha, Container, useTheme } from '@mui/material'

import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { FeatureOverviewPanel } from 'src/layouts/Landing/components/templates/FeatureOverviewPanel'
import { globeTestFeaturesMinimal } from 'src/layouts/Landing/content/globe-test-features'

const GlobeTestOverview = (): JSX.Element => {
  const theme = useTheme()

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <FeatureOverviewPanel
        title={
          <>
            <span
              style={{
                color: theme.palette.primary.main,
                background: `linear-gradient(180deg, transparent 82%, ${alpha(
                  theme.palette.secondary.main,
                  0.3
                )} 0%)`,
              }}
            >
              Load test
            </span>{' '}
            your APIs globally with a single click
          </>
        }
        description="Load test your API globally using distributed load testing with
                GlobeTest, our open source load testing tool built on top of K6. Import existing tests and run them instantly using our
                cloud infrastructure."
        elements={globeTestFeaturesMinimal}
        alignment="right"
        moreInfo={{
          text: 'Learn more about load testing with APITeam',
          link: ROUTES.loadTesting,
        }}
      />
    </Container>
  )
}

export default GlobeTestOverview
