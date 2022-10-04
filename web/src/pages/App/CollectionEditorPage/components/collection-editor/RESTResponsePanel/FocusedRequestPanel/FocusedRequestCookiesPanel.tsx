import { useEffect } from 'react'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CookieIcon from '@mui/icons-material/Cookie'
import {
  TableHead,
  Table,
  TableBody,
  TableRow,
  TableContainer,
  TableCell,
  Tooltip,
  useTheme,
  IconButton,
  Box,
} from '@mui/material'
import { ParamsCookieValue } from 'k6/http'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { QuickActionArea } from 'src/components/app/utils/QuickActionArea'

type UnderlyingRequestCookiesPanelProps = {
  cookies: ParamsCookieValue[]
  setActionArea: (actionArea: React.ReactNode) => void
}

export const UnderlyingRequestCookiesPanel = ({
  cookies,
  setActionArea,
}: UnderlyingRequestCookiesPanelProps) => {
  const theme = useTheme()

  useEffect(() => {
    const customActions = []

    if (cookies.length > 0) {
      customActions.push(
        <Tooltip title="Copy All" key="Copy All">
          <Box>
            <IconButton
              onClick={() =>
                navigator.clipboard.writeText(
                  `Name\tValue\tDomain\tPath\tHttpOnly\tSecure\tMax Age\tExpires\n${cookies
                    .map((cookie) => {
                      const values = Object.values(cookie)

                      return values
                        .map((value, index) => {
                          if (index === values.length - 1) {
                            return value
                          }

                          return `${value}\t`
                        })
                        .join('')
                    })
                    .join('\n')}`
                )
              }
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </Tooltip>
      )
    }

    setActionArea(<QuickActionArea customActions={customActions} />)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookies])

  console.log('cookies', cookies)

  return cookies.length > 0 ? (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {Object.keys(cookies[0]).map((key, index) => (
              <TableCell key={index}>{key}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cookies.map((cookie, index) => (
            <TableRow key={index}>
              {Object.entries(cookie).map(([key, value], index) => (
                <TableCell
                  sx={{
                    wordBreak: 'break-all',
                  }}
                  key={index}
                >
                  {key.toLowerCase() === 'expires'
                    ? new Date(value).toLocaleString()
                    : value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <EmptyPanelMessage
      icon={
        <CookieIcon
          sx={{
            marginBottom: 2,
            width: 80,
            height: 80,
            color: theme.palette.action.disabled,
          }}
        />
      }
      primaryText="No Cookies"
      secondaryMessages={['No Cookies were sent with this request']}
    />
  )
}
