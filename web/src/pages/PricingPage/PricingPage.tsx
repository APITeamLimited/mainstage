import { Typography, useTheme, Box } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'

const PricingPage = () => {
  const theme = useTheme()

  return (
    <>
      <MetaTags title="Plans and Pricing" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <EmptyPanelMessage
          primaryText="No plans and pricing yet!"
          secondaryMessages={[
            "We're still working on our paid plans, feel free to use APITeam for free until then!",
          ]}
          icon={
            <Typography
              variant="h1"
              sx={{ color: theme.palette.primary.main, fontSize: '80px' }}
            >
              🚧
            </Typography>
          }
        />
      </Box>
    </>
  )
}

export default PricingPage
