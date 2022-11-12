import { Typography, useTheme, Box } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'

const SupportPage = () => {
  const theme = useTheme()

  return (
    <>
      <MetaTags title="Support" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: theme.palette.text.primary }}
          gutterBottom
        >
          Support
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.primary }}
          gutterBottom
        >
          We are still building this page. In the meantime, please reach out to
          us at <a href="mailto:support@apiteam.cloud">support@apiteam.cloud</a>
        </Typography>
      </Box>
    </>
  )
}

export default SupportPage
