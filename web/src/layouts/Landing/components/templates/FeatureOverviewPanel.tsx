import { createRef, ElementType, useRef, useState } from 'react'

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
import {
  largePanelSpacing,
  mediumPanelSpacing,
  smallPanelSpacing,
} from '../constants'

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

  const elementsRefs = useRef(elements.map(() => createRef<HTMLDivElement>()))

  if (moreInfo && moreInfoElement) {
    throw new Error(
      'You cannot provide both moreInfo and moreInfoElement to FeatureOverviewPanel'
    )
  }

  return (
    <Stack spacing={largePanelSpacing}>
      <Stack spacing={smallPanelSpacing} alignItems="flex-start">
        <Typography
          variant="h2"
          fontWeight="bold"
          color={theme.palette.text.primary}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            color: theme.palette.text.secondary,
          }}
          variant="h6"
        >
          {description}
        </Typography>
        {moreInfo && (
          <CallToClickLink text={moreInfo.text} link={moreInfo.link} />
        )}
        {moreInfoElement}
      </Stack>
      <Stack
        direction={
          isSmall ? 'column' : alignment === 'left' ? 'row' : 'row-reverse'
        }
        spacing={mediumPanelSpacing}
      >
        <Stack spacing={2} sx={{ width: { md: '30%' } }}>
          {elements.map((element, i) => {
            //const isLast = i === elements.length - 1

            return (
              <div key={i}>
                {/* {!isLast && !isSmall && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlSpace="preserve"
                    enableBackground="new 0 0 595.28 841.89"
                    viewBox="0 0 776.09175 693.66538"
                    height="100"
                    width="50"
                    y="0px"
                    x="0px"
                    version="1.1"
                    style={{
                      position: 'absolute',

                      // Position over elementsRefs[i]
                      // /top: 0,
                      // left:
                      //   elementsRefs.current[i].current?.offsetLeft ?? 0 - 50,

                      // marginLeft: alignment === 'left' ? '0' : theme.spacing(2),
                      // marginRight:
                      //   alignment === 'right' ? '0' : theme.spacing(2),
                      fill: theme.palette.text.primary,
                      rotate: alignment === 'left' ? '55deg' : '-55deg',
                      // Mirror the icon if it's on the right side
                      transform:
                        alignment === 'right' ? 'scaleX(-1)' : undefined,
                    }}
                  >
                    <g
                      transform="matrix(2.7190747,0,0,3.1037754,-326.9763,-1172.9045)"
                      id="g3"
                    >
                      <path
                        style={{
                          clipRule: 'evenodd',
                          fillRule: 'evenodd',
                        }}
                        id="path5"
                        d="m 130.838,381.118 c 1.125,28.749 5.277,54.82 12.695,78.018 7.205,22.53 18.847,40.222 36.812,53.747 52.018,39.16 153.369,16.572 153.369,16.572 l -4.632,-32.843 72.918,42.778 -58.597,58.775 -3.85,-27.303 c 0,0 -100.347,18.529 -163.905,-34.881 -37.659,-31.646 -53.293,-84.021 -51.593,-153.962 0.266,-0.247 4.728,-0.908 6.783,-0.901 z"
                      />
                    </g>
                  </svg>
                )} */}
                <Card
                  ref={elementsRefs.current[i]}
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
              </div>
            )
          })}
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
