import { useRef, useState } from 'react'

import {
  defaultOAuth2Config,
  OAuth2Token,
  RESTAuth,
  RESTAuthOAuth2,
  RESTAuthOAuth2GrantType,
} from '@apiteam/types/src'
import { useApolloClient } from '@apollo/client'
import { Box, Stack } from '@mui/material'

import { snackSuccessMessageVar } from 'src/components/app/dialogs'
import {
  CustomFormSelect,
  FormEnvironmentTextField,
} from 'src/components/custom-mui'
import { useSimplebarReactModule } from 'src/contexts/imports'
import { getOAuth2Token } from 'src/utils/oauth2'

import { AuthenticatingDialog } from './AuthenticatingDialog'
import { AuthorizationCodeForm } from './AuthorizationCodeForm'
import { AuthorizationCodeWithPkceForm } from './AuthorizationCodeWithPkceForm'
import { ClientCredentialsForm } from './ClientCredentialsForm'
import { ImplicitForm } from './ImplicitForm'
import { ResourceOwnerPasswordCredentialsForm } from './ResourceOwnerPasswordCredentialsForm'
import { TokenManagerForm } from './TokenManagerForm'
import { WhereStoreTokenDialog } from './WhereStoreTokenDialog'

type OAuth2AuthFormProps = {
  auth: RESTAuthOAuth2
  setAuth: (auth: RESTAuth) => void
  activeId: string
}

export const OAuth2AuthForm = ({
  auth,
  setAuth,
  activeId,
}: OAuth2AuthFormProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()
  const apolloClient = useApolloClient()

  const abortRef = useRef<null | 'run' | 'abort'>(null)

  const [showAuthenticatingDialog, setShowAuthenticatingDialog] =
    useState(false)
  const [foundToken, setFoundToken] = useState<OAuth2Token | null>(null)

  const handleGrantTypeChange = (value: RESTAuthOAuth2GrantType) => {
    const newAuth = defaultOAuth2Config(value)

    // Copy any existing values from the old auth
    const copiedKeys = copyKeys(auth, newAuth, ['grantType']) as RESTAuthOAuth2

    setAuth(copiedKeys)
  }

  const handleGetToken = async () => {
    abortRef.current = 'run'

    // So doesn't flash if validation fails
    setTimeout(() => setShowAuthenticatingDialog(true), 300)

    const result = await getOAuth2Token(auth, apolloClient, abortRef)
    setShowAuthenticatingDialog(false)

    if (!result) {
      // Error already shown
      return
    }

    snackSuccessMessageVar('Successfully got OAuth2 token!')
    setFoundToken(result)
  }

  const namespace = `${activeId}-oauth2authform`

  return (
    <>
      <AuthenticatingDialog
        open={showAuthenticatingDialog}
        onCancel={() => {
          abortRef.current = 'abort'
          setShowAuthenticatingDialog(false)
        }}
      />
      <WhereStoreTokenDialog
        foundToken={foundToken}
        auth={auth}
        activeId={activeId}
        setAuth={setAuth}
        onClose={() => setFoundToken(null)}
      />
      <Box
        sx={{
          overflow: 'hidden',
          height: '100%',
          maxHeight: '100%',
        }}
      >
        <SimpleBar
          style={{ height: '100%', maxWidth: '100%', maxHeight: '100%' }}
        >
          <Stack
            alignItems="flex-start"
            spacing={2}
            sx={{
              width: '100%',
              height: '100%',
            }}
          >
            <TokenManagerForm
              auth={auth}
              setAuth={setAuth}
              getOAuth2Token={handleGetToken}
              activeId={activeId}
            />
            <CustomFormSelect
              label="Grant Type"
              value={auth.grantType}
              onChange={(value) =>
                handleGrantTypeChange(value as RESTAuthOAuth2GrantType)
              }
              options={[
                {
                  label: 'Authorization Code',
                  value: 'authorization-code',
                },
                {
                  label: 'Authorization Code with PKCE',
                  value: 'authorization-code-with-pkce',
                },
                // TODO: add support for these
                // {
                //   label: 'Implicit',
                //   value: 'implicit',
                // },
                // {
                //   label: 'Client Credentials',
                //   value: 'client-credentials',
                // },
                // {
                //   label: 'Resource Owner Password Credentials',
                //   value: 'resource-owner-password-credentials',
                // },
              ]}
            />
            <FormEnvironmentTextField
              label="Header Prefix"
              namespace={`${namespace}.headerPrefix`}
              onChange={(value) => setAuth({ ...auth, headerPrefix: value })}
              value={auth.headerPrefix}
            />
            {auth.grantType === 'authorization-code' && (
              <AuthorizationCodeForm
                auth={auth}
                setAuth={setAuth}
                namespace={`${namespace}-authorization-code`}
              />
            )}
            {auth.grantType === 'authorization-code-with-pkce' && (
              <AuthorizationCodeWithPkceForm
                auth={auth}
                setAuth={setAuth}
                namespace={`${namespace}-authorization-code-with-pkce`}
              />
            )}
            {auth.grantType === 'implicit' && (
              <ImplicitForm
                auth={auth}
                setAuth={setAuth}
                namespace={`${namespace}-implicit`}
              />
            )}
            {auth.grantType === 'client-credentials' && (
              <ClientCredentialsForm
                auth={auth}
                setAuth={setAuth}
                namespace={`${namespace}-client-credentials`}
              />
            )}
            {auth.grantType === 'resource-owner-password-credentials' && (
              <ResourceOwnerPasswordCredentialsForm
                auth={auth}
                setAuth={setAuth}
                namespace={`${namespace}-resource-owner-password-credentials`}
              />
            )}
          </Stack>
        </SimpleBar>
      </Box>
    </>
  )
}

// Copies any keys from sourceObject that are present in targetObject
const copyKeys = (
  sourceObject: Record<string, unknown>,
  targetObject: Record<string, unknown>,
  bannedKeys: string[] = []
) => {
  const newObject = { ...targetObject }

  for (const key of Object.keys(sourceObject)) {
    if (bannedKeys.includes(key)) {
      continue
    }

    if (key in targetObject) {
      newObject[key] = sourceObject[key]
    }
  }

  return newObject
}
