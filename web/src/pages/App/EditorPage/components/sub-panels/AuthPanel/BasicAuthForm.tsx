import { Auth, AuthBasic } from '@apiteam/types'
import { Box, Stack } from '@mui/material'

import { FormEnvironmentTextField } from 'src/components/custom-mui'
import { useSimplebarReactModule } from 'src/contexts/imports'

type BasicAuthFormProps = {
  auth: AuthBasic
  setAuth: (auth: Auth) => void
  namespace: string
}

export const BasicAuthForm = ({
  auth,
  setAuth,
  namespace,
}: BasicAuthFormProps) => {
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
            label="Username"
            namespace={`${namespace}.username`}
            onChange={(value) => setAuth({ ...auth, username: value })}
            value={auth.username}
          />
          <FormEnvironmentTextField
            label="Password"
            namespace={`${namespace}.password`}
            onChange={(value) => setAuth({ ...auth, password: value })}
            value={auth.password}
          />
        </Stack>
      </SimpleBar>
    </Box>
  )
}
