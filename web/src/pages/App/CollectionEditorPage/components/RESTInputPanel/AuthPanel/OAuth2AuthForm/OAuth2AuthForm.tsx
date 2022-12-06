import { RESTAuth, RESTAuthOAuth2 } from '@apiteam/types/src'
import {
  Box,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material'

import {
  CustomFormControlLabel,
  FormEnvironmentTextField,
} from 'src/components/custom-mui'
import { useSimplebarReactModule } from 'src/contexts/imports'

import { AuthorizationCodeForm } from './AuthorizationCodeForm'
import { ClientCredentialsForm } from './ClientCredentialsForm'
import { ImplicitForm } from './ImplicitForm'
import { ResourceOwnerPasswordCredentialsForm } from './ResourceOwnerPasswordCredentialsForm'

type OAuth2AuthFormProps = {
  auth: RESTAuthOAuth2
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const OAuth2AuthForm = ({
  auth,
  setAuth,
  namespace,
}: OAuth2AuthFormProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  return (
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
          <FormEnvironmentTextField
            label="Key"
            namespace={`${namespace}.apiKey`}
            onChange={(value) => setAuth({ ...auth, key: value })}
            value={auth.key}
          />
          <FormEnvironmentTextField
            label="Value"
            namespace={`${namespace}.apiKeyValue`}
            onChange={(value) => setAuth({ ...auth, value })}
            value={auth.value}
          />
          <div>
            <FormLabel>Add To</FormLabel>
            <RadioGroup
              row
              name="addTo"
              onChange={(event) =>
                setAuth({
                  ...auth,
                  addTo: event.target.value as 'header' | 'query',
                })
              }
              value={auth.addTo}
            >
              <CustomFormControlLabel value="header" label="Headers" />
              <CustomFormControlLabel value="query" label="Query Parameters" />
            </RadioGroup>
          </div>
          {auth.grantType === 'authorization-code' && (
            <AuthorizationCodeForm
              auth={auth}
              setAuth={setAuth}
              namespace={namespace}
            />
          )}
          {auth.grantType === 'implicit' && (
            <ImplicitForm auth={auth} setAuth={setAuth} namespace={namespace} />
          )}
          {auth.grantType === 'client-credentials' && (
            <ClientCredentialsForm
              auth={auth}
              setAuth={setAuth}
              namespace={namespace}
            />
          )}
          {auth.grantType === 'resource-owner-password-credentials' && (
            <ResourceOwnerPasswordCredentialsForm
              auth={auth}
              setAuth={setAuth}
              namespace={namespace}
            />
          )}
        </Stack>
      </SimpleBar>
    </Box>
  )
}
