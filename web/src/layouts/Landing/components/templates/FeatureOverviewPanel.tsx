import { ElementType, useState } from 'react'

import {
  useTheme,
  Typography,
  Box,
  useMediaQuery,
  Stack,
  MenuItem,
  Card,
  SvgIcon,
} from '@mui/material'

import { CallToClickLink } from '../CallToClickLink'
import { largePanelSpacing, mediumPanelSpacing } from '../constants'

export type FeatureOverviewElement = {
  icon: ElementType
  title: string
  description: string
  image: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    light: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dark: any
  }
}

type FeatureOverviewPanelProps = {
  title: string | JSX.Element
  description: string | JSX.Element
  elements: FeatureOverviewElement[]
  moreInfo?: {
    text: string
    link: string
  }
  moreInfoElement?: JSX.Element
  alignment?: 'left' | 'right'
}

export const FeatureOverviewPanel = ({
  title,
  description,
  elements,
  moreInfo,
  moreInfoElement,
  alignment = 'left',
}: FeatureOverviewPanelProps): JSX.Element => {
  const theme = useTheme()

  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  const [editorFeatureIndex, setEditorFeatureIndex] = useState(0)

  if (moreInfo && moreInfoElement) {
    throw new Error(
      'You cannot provide both moreInfo and moreInfoElement to FeatureOverviewPanel'
    )
  }

  return (
    <Stack spacing={largePanelSpacing}>
      <Box>
        <Typography
          variant="h3"
          fontWeight="bold"
          color={theme.palette.text.primary}
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
        {moreInfo && (
          <CallToClickLink text={moreInfo.text} link={moreInfo.link} />
        )}
        {moreInfoElement}
      </Box>
      <Stack
        direction={
          isSmall ? 'column' : alignment === 'left' ? 'row' : 'row-reverse'
        }
        spacing={mediumPanelSpacing}
      >
        <Stack spacing={2} sx={{ width: { md: '30%' } }}>
          {elements.map((element, i) => (
            <Card
              key={i}
              sx={{
                padding: 2,
                width: '100%',
                maxWidth: '100%',
                backgroundColor:
                  editorFeatureIndex === i
                    ? theme.palette.primary.main
                    : theme.palette.background.paper,
                // Ripple effect
                '.MuiTouchRipple-child': {
                  backgroundColor:
                    editorFeatureIndex === i
                      ? theme.palette.primary.dark
                      : theme.palette.primary.main,
                },

                // Hover effect
                '&:hover': {
                  backgroundColor:
                    editorFeatureIndex === i
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                },
              }}
              component={MenuItem}
              variant="outlined"
              onClick={() => setEditorFeatureIndex(i)}
            >
              <Stack spacing={2} sx={{ width: '100%' }}>
                <Stack spacing={2} direction="row" sx={{ width: '100%' }}>
                  <SvgIcon
                    component={element.icon}
                    width={40}
                    height={40}
                    sx={{
                      color:
                        editorFeatureIndex === i
                          ? theme.palette.background.paper
                          : theme.palette.primary.main,
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color:
                        editorFeatureIndex === i
                          ? theme.palette.background.paper
                          : theme.palette.text.primary,
                      whiteSpace: 'normal',
                    }}
                  >
                    {element.title}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      editorFeatureIndex === i
                        ? theme.palette.background.paper
                        : theme.palette.text.secondary,
                    whiteSpace: 'normal',
                  }}
                >
                  {element.description}
                </Typography>
              </Stack>
            </Card>
          ))}
        </Stack>
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ width: { md: '70%' } }}
        >
          <div>
            <Box
              sx={{
                borderRadius: 1,
                boxShadow: 10,
                overflow: 'hidden',
                display: 'flex',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={
                  theme.palette.mode === 'light'
                    ? elements[editorFeatureIndex].image.light
                    : elements[editorFeatureIndex].image.dark
                }
                alt="App demo"
                style={{
                  width: '100%',
                  // Prevent stretching
                  height: 'auto',
                }}
              />
            </Box>
          </div>
        </Stack>
      </Stack>
    </Stack>
  )
}
