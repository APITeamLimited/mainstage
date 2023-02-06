import { Auth, AuthAPIKey } from '@apiteam/types/src'
import {
  Box,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material'

import {
  CustomFormRadioGroup,
  FormEnvironmentTextField,
} from 'src/components/custom-mui'
import { useSimplebarReactModule } from 'src/contexts/imports'

type APIKeyAuthFormProps = {
  auth: AuthAPIKey
  setAuth: (auth: Auth) => void
  namespace: string
}

export const APIKeyAuthForm = ({
  auth,
  setAuth,
  namespace,
}: APIKeyAuthFormProps) => {
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
            display: 'flex',
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
          <CustomFormRadioGroup
            label="Add To"
            name="addTo"
            value={auth.addTo}
            onChange={(event) =>
              setAuth({
                ...auth,
                addTo: event.target.value as 'header' | 'query',
              })
            }
            options={[
              { label: 'Headers', value: 'header' },
              { label: 'Query Parameters', value: 'query' },
            ]}
          />
        </Stack>
      </SimpleBar>
    </Box>
  )
}
