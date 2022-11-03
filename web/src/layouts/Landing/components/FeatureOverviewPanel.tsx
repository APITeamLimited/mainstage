import { ElementType, useState } from 'react'

import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  useTheme,
  Typography,
  Box,
  useMediaQuery,
  Stack,
  MenuItem,
  Card,
  SvgIcon,
  Button,
} from '@mui/material'

import { navigate } from '@redwoodjs/router'

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
  alignment?: 'left' | 'right'
}

const gridSpacing = 8

export const FeatureOverviewPanel = ({
  title,
  description,
  elements,
  moreInfo,
  alignment = 'left',
}: FeatureOverviewPanelProps): JSX.Element => {
  const theme = useTheme()

  const isSmall = useMediaQuery(theme.breakpoints.down('md'))

  const [editorFeatureIndex, setEditorFeatureIndex] = useState(0)

  return (
    <Stack spacing={gridSpacing}>
      <Box>
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
        {moreInfo && (
          <Button
            variant="outlined"
            onClick={() => navigate(moreInfo.link)}
            endIcon={<ChevronRightIcon />}
          >
            {moreInfo.text}
          </Button>
        )}
      </Box>
      <Stack
        direction={
          isSmall
            ? alignment === 'left'
              ? 'column'
              : 'column-reverse'
            : alignment === 'left'
            ? 'row'
            : 'row-reverse'
        }
        spacing={4}
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
