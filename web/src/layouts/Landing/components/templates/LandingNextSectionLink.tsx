import { Box, Typography, useTheme } from '@mui/material'

import { CallToClickLink } from '../CallToClickLink'

type LandingNextSectionLinkProps = {
  primaryText: string
  secondaryText: string
  callToClickLink: {
    text: string
    link: string
  }
}

export const LandingNextSectionLink = ({
  primaryText,
  secondaryText,
  callToClickLink,
}: LandingNextSectionLinkProps) => {
  const theme = useTheme()

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        color={theme.palette.text.primary}
        gutterBottom
      >
        {primaryText}
      </Typography>
      <Typography
        sx={{
          color: theme.palette.text.secondary,
          marginBottom: 2,
        }}
        variant="h6"
      >
        {secondaryText}
      </Typography>
      <CallToClickLink {...callToClickLink} />
    </Box>
  )
}
