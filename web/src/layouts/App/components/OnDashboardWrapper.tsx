import { Box, Container } from '@mui/material'

import { useSimplebarReactModule } from 'src/contexts/imports'

type OnDashboardWrapeprProps = {
  children: React.ReactNode
}

export const OnDashboardWrapper = ({ children }: OnDashboardWrapeprProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  return (
    <Box sx={{ height: '100%', maxHeight: '94vh', overflow: 'hidden' }}>
      <SimpleBar style={{ maxHeight: '94vh', height: '100%' }}>
        <Container
          sx={{
            paddingY: 6,
            minHeight: '94vh',
          }}
        >
          {children}
        </Container>
      </SimpleBar>
    </Box>
  )
}
