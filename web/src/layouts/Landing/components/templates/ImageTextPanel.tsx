import { useTheme, useMediaQuery, Stack, Box, Typography } from '@mui/material'

import { largePanelSpacing } from '../constants'

type ImageTextPanelProps = {
  title: string | JSX.Element
  description: string | JSX.Element
  image: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    light: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dark: any
  }
  alignment?: 'left' | 'right'
}

export const ImageTextPanel = ({
  title,
  description,
  image,
  alignment = 'left',
}: ImageTextPanelProps) => {
  const theme = useTheme()

  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Stack
      spacing={largePanelSpacing}
      direction={
        isSmall ? 'column' : alignment === 'left' ? 'row' : 'row-reverse'
      }
    >
      <Box sx={{ width: isSmall ? '100%' : '50%' }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700 }}
          color={theme.palette.text.primary}
          gutterBottom
        >
          {title}
        </Typography>
        <Typography
          sx={{
            color: theme.palette.text.secondary,
            marginBottom: 2,
          }}
          variant="h6"
        >
          {description}
        </Typography>
      </Box>
      <Box
        sx={{
          borderRadius: 1,
          boxShadow: 10,
          overflow: 'hidden',
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          width: isSmall ? '100%' : '50%',
        }}
      >
        <img
          src={theme.palette.mode === 'light' ? image.light : image.dark}
          alt="App demo"
          style={{
            width: '100%',
            // Prevent stretching
            height: 'auto',
          }}
        />
      </Box>
    </Stack>
  )
}
