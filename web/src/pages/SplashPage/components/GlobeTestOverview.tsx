import { ROUTES } from '@apiteam/types/src'
import { useTheme } from '@mui/material'

import { FeatureOverviewPanel } from 'src/layouts/Landing/components/templates/FeatureOverviewPanel'
import { globeTestFeaturesMinimal } from 'src/layouts/Landing/content/globe-test-features'

const GlobeTestOverview = (): JSX.Element => {
  const theme = useTheme()

  return (
    <FeatureOverviewPanel
      title={
        <>
          <span
            style={{
              color: theme.palette.primary.main,
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
  )
}

export default GlobeTestOverview
