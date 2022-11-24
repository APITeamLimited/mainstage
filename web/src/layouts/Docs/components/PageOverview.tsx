import {
  Card,
  Divider,
  Typography,
  useTheme,
  Stack,
  useMediaQuery,
} from '@mui/material'

import { DocHeading, useDocsHeadings } from '../DocHeadingsProvider'

export const PageOverview = () => {
  const theme = useTheme()
  const isMediumOrLess = useMediaQuery(theme.breakpoints.down('lg'))

  const headings = useDocsHeadings()

  const handleScrollToHeading = (heading: DocHeading) => {
    heading.ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <Card
      sx={{
        p: 2,
        width: isMediumOrLess ? undefined : 250,
        maxWidth: '100%',
        flexGrow: isMediumOrLess ? 1 : undefined,
      }}
    >
      <Stack
        spacing={2}
        sx={{
          width: '100%',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Page Overview
        </Typography>
        <Divider />
        <Stack
          spacing={1}
          sx={{
            width: '100%',
          }}
        >
          {headings.map((heading, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                paddingLeft: heading.depth * 2,
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                cursor: 'pointer',
                // Bullet point
                '&::before': {
                  content: '"•"',
                  color: theme.palette.text.secondary,
                  marginLeft: 1,
                  marginRight: 2,
                },
              }}
              onClick={() => handleScrollToHeading(heading)}
            >
              {heading.title}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}
