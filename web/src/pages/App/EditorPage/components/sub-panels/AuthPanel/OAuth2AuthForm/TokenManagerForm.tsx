import { useEffect, useState } from 'react'
import { useCallback } from 'react'

import { OAuth2Token, RESTAuth, WrappedOAuth2Token } from '@apiteam/types/src'
import {
  Button,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'

import { useActiveWrappedToken } from './use-active-wrapped-token'

type TokenManagerFormProps = {
  auth: RESTAuth & {
    authType: 'oauth2'
  }
  setAuth: (auth: RESTAuth) => void
  getOAuth2Token: () => void
  activeId: string
}

export const TokenManagerForm = ({
  auth,
  setAuth,
  getOAuth2Token,
  activeId,
}: TokenManagerFormProps) => {
  const theme = useTheme()

  const changeActiveWrappedToken = useCallback(
    (access_token: string) => {
      const token = auth.existingAccessTokens.find(
        (token) => token.token.access_token === access_token
      )

      if (token === undefined) {
        return
      }

      localStorage.setItem(
        `apiteam:oauth2:${activeId}:active`,
        JSON.stringify(token)
      )
    },
    [activeId, auth.existingAccessTokens]
  )

  const handleTokenDelete = (wrappedToken: WrappedOAuth2Token) => {
    // Check if the token to be deleted is the active token
    const activeWrappedToken = localStorage.getItem(
      `apiteam:oauth2:${activeId}:active`
    )

    if (activeWrappedToken !== null) {
      const storedToken = JSON.parse(activeWrappedToken) as OAuth2Token

      if (storedToken.access_token === wrappedToken.token.access_token) {
        localStorage.removeItem(`apiteam:oauth2:${activeId}:active`)
      }
    }

    setAuth({
      ...auth,
      existingAccessTokens: auth.existingAccessTokens.filter(
        (token) => token.token.access_token !== wrappedToken.token.access_token
      ),
    })
  }

  const activeWrappedToken = useActiveWrappedToken(activeId, auth)

  // Refresh minutes
  const [minutesKey, setMinutesKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesKey((prev) => prev + 1)
    }, 1000 * 60)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Stack
        spacing={0.5}
        sx={{
          width: '100%',
        }}
      >
        <FormLabel
          sx={{
            marginBottom: 1,
          }}
        >
          Active Token
        </FormLabel>
        {auth.existingAccessTokens.length > 0 && activeWrappedToken ? (
          <Select
            value={activeWrappedToken.token.access_token}
            onChange={(event) => changeActiveWrappedToken(event.target.value)}
            size="small"
            fullWidth
            key={minutesKey}
          >
            {auth.existingAccessTokens.map((wrappedToken, index) => {
              const prettyExpiry = getPrettyExpiryDate(wrappedToken)

              return (
                <MenuItem key={index} value={wrappedToken.token.access_token}>
                  <span
                    style={{
                      color: prettyExpiry === 'Expired' ? 'red' : 'inherit',
                    }}
                  >
                    {wrappedToken.token.access_token.slice(0, 10)}...{' '}
                    {prettyExpiry}{' '}
                    {prettyExpiry !== 'Expired' ? 'Remaining' : ''} (
                    {wrappedToken.syncType === 'local' ? 'Local' : 'Workspace'})
                  </span>
                </MenuItem>
              )
            })}
          </Select>
        ) : (
          <Typography variant="body2" color={theme.palette.grey[500]}>
            No tokens found
          </Typography>
        )}
      </Stack>
      <Grid container direction="row">
        <Grid item sx={{ marginRight: 2, marginBottom: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={getOAuth2Token}
            size="small"
          >
            Generate New Token
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: 2, marginBottom: 2 }}>
          <Button
            variant="contained"
            color="warning"
            disabled={!activeWrappedToken}
            onClick={() => {
              if (!activeWrappedToken) {
                throw new Error('No active token')
              }
              handleTokenDelete(activeWrappedToken)
            }}
            size="small"
          >
            Delete Active Token
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: 2, marginBottom: 2 }}>
          <Button
            variant="contained"
            color="error"
            disabled={auth.existingAccessTokens.length === 0}
            onClick={() =>
              auth.existingAccessTokens.forEach((token) =>
                handleTokenDelete(token)
              )
            }
            size="small"
          >
            Delete All Tokens
          </Button>
        </Grid>
        <Grid item sx={{ marginRight: 2, marginBottom: 2 }}>
          <Button
            variant="contained"
            color="success"
            disabled={
              auth.existingAccessTokens.filter(
                (token) => getPrettyExpiryDate(token) === 'Expired'
              ).length === 0
            }
            onClick={() =>
              auth.existingAccessTokens
                .filter((token) => getPrettyExpiryDate(token) === 'Expired')
                .forEach((token) => handleTokenDelete(token))
            }
            size="small"
          >
            Delete Expired Tokens
          </Button>{' '}
        </Grid>
      </Grid>
    </>
  )
}

const getPrettyExpiryDate = (token: WrappedOAuth2Token) => {
  const expiryDate = new Date(
    new Date(token.createdAt).getTime() + token.token.expires_in * 1000
  )

  if (expiryDate.getTime() < new Date().getTime()) {
    return 'Expired'
  }

  // Print days, hours, minutes
  const days = Math.floor(
    (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  const hours = Math.floor(
    (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60)
  )
  const minutes = Math.floor(
    (expiryDate.getTime() - new Date().getTime()) / (1000 * 60)
  )

  if (days > 0) {
    return `${days}D ${hours % 24}H ${minutes % 60}M`
  }

  if (hours > 0) {
    return `${hours}H ${minutes % 60}M`
  }

  return `${minutes}M`
}
