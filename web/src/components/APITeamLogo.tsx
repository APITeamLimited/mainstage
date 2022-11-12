import { ROUTES } from '@apiteam/types/src'
import { Box, useTheme } from '@mui/material'

import { useLocation, navigate } from '@redwoodjs/router'

export const LOGO_DEFAULT_HEIGHT = '32px'

type APITeamLogoProps = {
  height?: number | string
  disableLinks?: boolean
  alignSelf?: 'flex-start' | 'center' | 'flex-end'
}

export const APITeamLogo = ({
  height = LOGO_DEFAULT_HEIGHT,
  disableLinks,
  alignSelf,
}: APITeamLogoProps) => {
  const theme = useTheme()

  const { pathname } = useLocation()
  const isInApp = pathname.includes('/app')

  const actualDisableLinks = disableLinks
    ? true
    : pathname === ROUTES.splash || pathname === ROUTES.dashboard

  const inner = (
    <svg
      viewBox="0 0 1200 300"
      height={height}
      style={{
        alignSelf,
      }}
    >
      <g transform="translate(-480, -625) scale(2)">
        <g
          id="title"
          style={{
            fontStyle: 'normal',
            fontWeight: 'normal',
            fontSize: '72px',
            lineHeight: 1,
            fontFamily: 'Lexend', //'Brandmark Sans 11 Color Shadow',
            fontVariantLigatures: 'normal',
            textAlign: 'center',
            textAnchor: 'middle',
          }}
          transform="translate(0 0)"
        >
          <g
            id="path180648"
            aria-label="A"
            transform="translate(0 302.99833128) translate(243.79 40.016904) scale(1.14) translate(-273.42382 72)"
          >
            <path
              className="c1"
              d="M139.99072,136H121.9292l-21.375-38.47742L79.18945,136H60.00928l30.95459-55.7395L100,64l9.58984,17.26221 L139.99072,136z"
              transform="translate(213.41454 -136)"
              strokeWidth="0"
              strokeLinejoin="miter"
              strokeMiterlimit="2"
              fill={theme.palette.text.primary}
              stroke={theme.palette.text.primary}
            ></path>
          </g>
          <g
            id="path180650"
            aria-label="P"
            transform="translate(0 302.99833128) translate(345.13907209999996 39.90643344) scale(1.14) translate(-362.32267 72.096904)"
          >
            <path
              className="c1"
              d="M110.11377,64.52222c-1.71606-0.33984-3.49487-0.52197-5.32056-0.52197V64H86.10327v0.00024H70.11914V136 h15.98438v-23.95532h18.6897c13.83301,0,25.08765-10.18872,25.08765-24.02234 C129.88086,76.0144,121.39893,66.75781,110.11377,64.52222z M104.79321,98.19189h-18.6897V77.85303h18.6897 c5.02002,0,9.10327,5.14929,9.10327,10.16931c0,4.28833-2.9834,8.65979-6.98145,9.84631 C106.23291,98.07117,105.5249,98.19189,104.79321,98.19189z"
              transform="translate(292.20353 -136.096904)"
              strokeWidth="0"
              strokeLinejoin="miter"
              strokeMiterlimit="2"
              fill={theme.palette.text.primary}
              stroke={theme.palette.text.primary}
            ></path>
          </g>
          <g
            id="path180652"
            aria-label="I"
            transform="translate(0 302.99833128) translate(426.0968788999999 39.90643344) scale(1.14) translate(-433.33829 72.096904)"
          >
            <path
              className="c1"
              d="M92.00781,64h15.98438v72H92.00781V64z"
              transform="translate(341.33048 -136.096904)"
              strokeWidth="0"
              strokeLinejoin="miter"
              strokeMiterlimit="2"
              fill={theme.palette.text.primary}
              stroke={theme.palette.text.primary}
            ></path>
          </g>
          <g transform="translate(30, 0)">
            <g
              id="path180654"
              aria-label="T"
              transform="translate(0 302.99833128) translate(455.64940669999993 39.90643344) scale(1.14) translate(-459.26156 72.096904)"
            >
              <path
                className="c1"
                d="M107.99207,64.00037h21.09521v13.85291h-21.09521V136H92.00793V77.85327H70.91272V64.00037h21.09521V64 h15.98413V64.00037z"
                transform="translate(388.34884 -136.096904)"
                strokeWidth="0"
                strokeLinejoin="miter"
                strokeMiterlimit="2"
                fill={theme.palette.text.primary}
                stroke={theme.palette.text.primary}
              ></path>
            </g>
            <g
              id="path180656"
              aria-label="E"
              transform="translate(0 302.99833128) translate(533.1856289 39.90643344) scale(1.14) translate(-527.27579 72.096904)"
            >
              <path
                className="c1"
                d="M91.23039,122.15475h33.52547v13.85508H91.23039H75.24413V64h15.98626h33.52499v13.85496l-33.52499,0.00012 v15.44187h27.95727v13.85508H91.23039V122.15475z"
                transform="translate(452.03166 -136.096904)"
                strokeWidth="0"
                strokeLinejoin="miter"
                strokeMiterlimit="2"
                fill={theme.palette.text.primary}
                stroke={theme.palette.text.primary}
              ></path>
            </g>
            <g
              id="path180658"
              aria-label="A"
              transform="translate(0 302.99833128) translate(597.28 39.90643344) scale(1.14) translate(-583.50195 72.096904)"
            >
              <polygon
                className="c1"
                points="90.96389,80.26048 100.55395,97.52252 121.92904,136 139.99039,136 109.58989,81.26211 99.99983,64 "
                transform="translate(523.49267 -136.096904)"
                strokeWidth="0"
                strokeLinejoin="miter"
                strokeMiterlimit="2"
                fill={theme.palette.text.primary}
                stroke={theme.palette.text.primary}
              ></polygon>
              <linearGradient
                id="e2157aab-a0db-4697-b873-41910ca2577c"
                gradientUnits="userSpaceOnUse"
                x1="127.32748"
                y1="113.82432"
                x2="91.08822"
                y2="83.20757"
              >
                <stop
                  offset="0"
                  style={{
                    stopColor: theme.palette.text.primary,
                    stopOpacity: 0,
                  }}
                ></stop>
                <stop
                  offset="0.23462"
                  style={{
                    stopColor: theme.palette.text.primary,
                    stopOpacity: 0.29264,
                  }}
                ></stop>
                <stop
                  offset="0.52244"
                  style={{
                    stopColor: theme.palette.text.primary,
                    stopOpacity: 0.65165,
                  }}
                ></stop>
                <stop
                  offset="0.72155"
                  style={{
                    stopColor: theme.palette.text.primary,
                    stopOpacity: 0.9,
                  }}
                ></stop>
              </linearGradient>
              <polygon
                className="highlight"
                fill="url(#e2157aab-a0db-4697-b873-41910ca2577c)"
                points="90.96389,80.26048 100.55395,97.52252 121.92904,136 139.99039,136 109.58989,81.26211 99.99983,64 "
                transform="translate(523.49267 -136.096904)"
                strokeWidth="0"
                strokeLinejoin="miter"
                strokeMiterlimit="2"
                opacity="0.66"
              ></polygon>
              <polygon
                className="c2"
                points="60.00928,136 79.18938,136 100.55395,97.52252 109.58989,81.26211 99.99983,64 90.96389,80.26048 "
                transform="translate(523.49267 -136.096904)"
                strokeWidth="0"
                strokeLinejoin="miter"
                strokeMiterlimit="2"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.main}
              ></polygon>
            </g>
            <g
              id="path180660"
              aria-label="M"
              transform="translate(0 302.99833128) translate(698.7884471000001 39.90643344) scale(1.14) translate(-672.54142 72.096904)"
            >
              <path
                className="c1"
                d="M119.97192,85.40576L135.71606,64v0.00171v23.44214v48.55249h-15.9834v-26.823L100,136l-19.73267-26.82666 v26.823h-15.9834V87.44385V64.00171V64l15.74414,21.40576L100,112.55786L119.97192,85.40576z"
                transform="translate(608.25749 -136.096904)"
                strokeWidth="0"
                strokeLinejoin="miter"
                strokeMiterlimit="2"
                fill={theme.palette.text.primary}
                stroke={theme.palette.text.primary}
              ></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )

  return actualDisableLinks ? (
    inner
  ) : (
    <Box
      onClick={() => navigate(isInApp ? ROUTES.dashboard : ROUTES.splash)}
      sx={{
        textDecoration: 'none',
        color: theme.palette.text.primary,
        userSelect: 'none',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        WebkitUserDrag: 'none',
        height,
        cursor: 'pointer',
        alignSelf,
      }}
    >
      {inner}
    </Box>
  )
}
