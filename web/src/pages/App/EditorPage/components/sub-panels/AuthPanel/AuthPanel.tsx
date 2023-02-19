import { useEffect, useMemo } from 'react'

import { defaultOAuth2Config, Auth } from '@apiteam/types'
import InputIcon from '@mui/icons-material/Input'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import { useTheme } from '@mui/material'

import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'

import { APIKeyAuthForm } from './APIKeyAuthForm'
import { BasicAuthForm } from './BasicAuthForm'
import { BearerAuthForm } from './BearerAuthForm'
import { OAuth2AuthForm } from './OAuth2AuthForm/OAuth2AuthForm'

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
  {
    authType: 'oauth2',
    label: 'OAuth 2',
  },
  {
    authType: 'api-key',
    label: 'API Key',
  },
]

type AuthPanelProps = {
  auth: Auth
  setAuth: (auth: Auth) => void
  namespace: string
  setActionArea: (actionArea: React.ReactNode) => void
  disableInherit?: boolean
  oauthLocalSaveKey: string
}

export const AuthPanel = ({
  auth,
  setActionArea,
  setAuth,
  namespace,
  disableInherit,
  oauthLocalSaveKey,
}: AuthPanelProps) => {
  const theme = useTheme()

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

    if (newAuthType === 'inherit') {
      if (disableInherit) {
        throw new Error('Inherit auth type is disabled')
      }

      setAuth({
        authType: 'inherit',
      })
    } else if (newAuthType === 'none') {
      setAuth({
        authType: 'none',
      })
    } else if (newAuthType === 'basic') {
      setAuth({
        authType: 'basic',
        username: '',
        password: '',
      })
    } else if (newAuthType === 'bearer') {
      setAuth({
        authType: 'bearer',
        token: '',
      })
    } else if (newAuthType === 'oauth2') {
      setAuth(defaultOAuth2Config('authorization-code'))
    } else if (newAuthType === 'api-key') {
      setAuth({
        authType: 'api-key',
        key: '',
        value: '',
        addTo: 'header',
      })
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
        <BasicAuthForm
          auth={auth}
          setAuth={setAuth}
          namespace={`${namespace}.basic`}
        />
      )}
      {auth.authType === 'bearer' && (
        <BearerAuthForm
          auth={auth}
          setAuth={setAuth}
          namespace={`${namespace}.bearer`}
        />
      )}
      {auth.authType === 'oauth2' && (
        <OAuth2AuthForm
          auth={auth}
          setAuth={setAuth}
          oauthLocalSaveKey={oauthLocalSaveKey}
        />
      )}
      {auth.authType === 'api-key' && (
        <APIKeyAuthForm
          auth={auth}
          setAuth={setAuth}
          namespace={`${namespace}.apiKey`}
        />
      )}
    </>
  )
}
