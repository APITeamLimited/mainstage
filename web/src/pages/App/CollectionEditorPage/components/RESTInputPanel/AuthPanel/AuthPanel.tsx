import { useEffect, useMemo, useState } from 'react'

import { RESTAuth } from '@apiteam/types/src'
import InputIcon from '@mui/icons-material/Input'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { Grid, Stack, useTheme, Typography, Chip, Box } from '@mui/material'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'
import { useSimplebarReactModule } from 'src/contexts/imports'

import { APIKeyAuthForm } from './APIKeyAuthForm'
import { BasicAuthForm } from './BasicAuthForm'
import { BearerAuthForm } from './BearerAuthForm'
import { OAuth2AuthForm } from './OAuth2AuthForm'

const authMethodLabels = [
  {
    authType: 'inherit',
    label: 'Inherit',
  },
  {
    authType: 'none',
    label: 'None',
  },
  {
    authType: 'basic',
    label: 'Basic',
  },
  {
    authType: 'bearer',
    label: 'Bearer',
  },
  // TODO: Add OAuth2 support and more auth methods
  //{
  //  authType: 'oauth-2',
  //  label: 'OAuth 2',
  //},
  {
    authType: 'api-key',
    label: 'API Key',
  },
]

type AuthPanelProps = {
  auth: RESTAuth
  setAuth: (auth: RESTAuth) => void
  namespace: string
  setActionArea: (actionArea: React.ReactNode) => void
  disableInherit?: boolean
}

export const AuthPanel = ({
  auth,
  setActionArea,
  setAuth,
  namespace,
  disableInherit,
}: AuthPanelProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  const theme = useTheme()
  const [unsavedAuths, setUnsavedAuths] = useState<RESTAuth[]>([auth])

  useEffect(() => {
    setActionArea(<></>)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChipChange = (index: number) => {
    const newAuthType = getAuthMethodFromIndex(index)

    if (newAuthType === undefined) {
      handleChipChange(0)
      return
    }

    setUnsavedAuths((prevAuths) => {
      const newUnsavedauths = prevAuths.filter(
        (prevAuth) => prevAuth.authType !== auth.authType
      )
      return [...newUnsavedauths, { ...auth, auth }]
    })

    if (newAuthType === 'inherit') {
      if (disableInherit) {
        throw new Error('Inherit auth type is disabled')
      }

      setAuth(
        unsavedAuths.find(
          (unsavedAuth) => unsavedAuth.authType === 'inherit'
        ) || {
          authType: 'inherit',
        }
      )
    } else if (newAuthType === 'none') {
      setAuth(
        unsavedAuths.find((unsavedAuth) => unsavedAuth.authType === 'none') || {
          authType: 'none',
        }
      )
    } else if (newAuthType === 'basic') {
      setAuth(
        unsavedAuths.find(
          (unsavedAuth) => unsavedAuth.authType === 'basic'
        ) || {
          authType: 'basic',
          username: '',
          password: '',
        }
      )
    } else if (newAuthType === 'bearer') {
      setAuth(
        unsavedAuths.find(
          (unsavedAuth) => unsavedAuth.authType === 'bearer'
        ) || {
          authType: 'bearer',
          token: '',
        }
      )
    } else if (newAuthType === 'oauth-2') {
      setAuth(
        unsavedAuths.find(
          (unsavedAuth) => unsavedAuth.authType === 'oauth-2'
        ) || {
          authType: 'oauth-2',
          token: '',
          oidcDiscoveryURL: '',
          authURL: '',
          accessTokenURL: '',
          clientID: '',
          scope: '',
        }
      )
    } else if (newAuthType === 'api-key') {
      setAuth(
        unsavedAuths.find(
          (unsavedAuth) => unsavedAuth.authType === 'api-key'
        ) || {
          authType: 'api-key',
          key: '',
          value: '',
          addTo: 'header',
        }
      )
    } else {
      throw `handleChangeAuthType unsupported authType: ${newAuthType}`
    }
  }

  const authLabels = useMemo(() => {
    const labels = authMethodLabels.map((method) => method.label)
    if (disableInherit) {
      return labels.filter((label) => label !== 'Inherit')
    }
    return labels
  }, [disableInherit])

  const authMethods = useMemo(() => {
    const methods = authMethodLabels.map((method) => method.authType)
    if (disableInherit) {
      return methods.filter((method) => method !== 'inherit')
    }
    return methods
  }, [disableInherit])

  const getIndexOfAuthMethod = (authMethod: string) => {
    return (
      authMethods.findIndex(
        (knownContentType) => knownContentType === authMethod
      ) || null
    )
  }

  const getAuthMethodFromIndex = (index: number) => {
    if (index > authMethods.length) {
      throw new Error('Index out of bounds for auth methods')
    }
    return authMethods[index]
  }

  if (auth.authType === 'inherit' && disableInherit) {
    throw new Error('Inherit auth type is disabled')
  }

  return (
    <>
      <SecondaryChips
        names={authLabels}
        value={getIndexOfAuthMethod(auth.authType) || 0}
        onChange={handleChipChange}
      />

      {auth.authType === 'inherit' && (
        <EmptyPanelMessage
          primaryText="Inherit"
          secondaryMessages={[
            'Auth type wil be inherited from parent folder or collection',
          ]}
          icon={
            <InputIcon
              sx={{
                marginBottom: 2,
                width: 80,
                height: 80,
                color: theme.palette.action.disabled,
              }}
            />
          }
        />
      )}
      {auth.authType === 'none' && (
        <EmptyPanelMessage
          primaryText="None"
          secondaryMessages={['No auth will be used']}
          icon={
            <LockOpenIcon
              sx={{
                marginBottom: 2,
                width: 80,
                height: 80,
                color: theme.palette.action.disabled,
              }}
            />
          }
        />
      )}
      {auth.authType === 'basic' && (
        <BasicAuthForm auth={auth} setAuth={setAuth} namespace={namespace} />
      )}
      {auth.authType === 'bearer' && (
        <BearerAuthForm auth={auth} setAuth={setAuth} namespace={namespace} />
      )}
      {/*auth.authType === 'oauth-2' && (
          <Stack
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <OAuth2AuthForm
              auth={auth}
              setAuth={setAuth}
              requestId={requestId}
            />
          </Stack>
          )*/}
      {auth.authType === 'api-key' && (
        <APIKeyAuthForm auth={auth} setAuth={setAuth} namespace={namespace} />
      )}
    </>
  )
}
