import { Stack, useTheme, Typography, Box, Divider } from '@mui/material/'

import { largePanelSpacing } from 'src/layouts/Landing/components/constants'

type HeadlineProps = {
  headline: string
  sublines?: string[]
  padBottom?: boolean
}

export const Headline = ({
  headline,
  sublines = [],
  padBottom,
}: HeadlineProps) => {
  const theme = useTheme()

  const lengthSublines = sublines.length

  return (
    <Stack
      spacing={largePanelSpacing}
      sx={{ paddingBottom: padBottom ? largePanelSpacing : undefined }}
    >
      <Box position="relative" zIndex={2}>
        <Typography
          fontWeight={600}
          variant="h2"
          gutterBottom={sublines.length > 0}
          align="center"
        >
          {headline}
        </Typography>
        {sublines.map((subline, index) => (
          <Typography
            key={index}
            variant="h6"
            color={theme.palette.text.secondary}
            align="center"
            gutterBottom={index !== lengthSublines - 1}
          >
            {subline}
          </Typography>
        ))}
      </Box>
      <Divider />
    </Stack>
  )
}
