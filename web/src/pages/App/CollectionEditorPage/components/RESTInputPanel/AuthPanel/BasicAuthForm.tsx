import { RESTAuth, RESTAuthBasic } from '@apiteam/types/src'
import { Box, Stack } from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { useSimplebarReactModule } from 'src/contexts/imports'

type BasicAuthFormProps = {
  auth: RESTAuthBasic
  setAuth: (auth: RESTAuth) => void
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
          <div
            style={{
              width: '100%',
            }}
          >
            <EnvironmentTextField
              label="Username"
              namespace={`${namespace}.username`}
              onChange={(value) => setAuth({ ...auth, username: value })}
              value={auth.username}
            />
          </div>
          <div
            style={{
              width: '100%',
            }}
          >
            <EnvironmentTextField
              label="Password"
              namespace={`${namespace}.password`}
              onChange={(value) => setAuth({ ...auth, password: value })}
              value={auth.password}
            />
          </div>
        </Stack>
      </SimpleBar>
    </Box>
  )
}
