import { Stack } from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { RESTAuth, RESTAuthBasic } from 'src/contexts/reactives'

type BasicAuthFormProps = {
  auth: RESTAuthBasic & { authActive: boolean }
  setAuth: (auth: RESTAuth) => void
  requestId: string
}

export const BasicAuthForm = ({
  auth,
  setAuth,
  requestId,
}: BasicAuthFormProps) => {
  return (
    <Stack
      alignItems="flex-start"
      spacing={2}
      sx={{
        width: '100%',
      }}
    >
      <div
        style={{
          width: '100%',
        }}
      >
        <EnvironmentTextField
          label="Username"
          namespace={`${requestId}.username`}
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
          namespace={`${requestId}.password`}
          onChange={(value) => setAuth({ ...auth, password: value })}
          value={auth.password}
        />
      </div>
    </Stack>
  )
}
