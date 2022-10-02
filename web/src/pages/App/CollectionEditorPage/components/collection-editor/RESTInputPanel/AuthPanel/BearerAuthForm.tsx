import { Stack } from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { RESTAuth, RESTAuthBearer } from 'src/contexts/reactives'

type BearerAuthFormProps = {
  auth: RESTAuthBearer
  setAuth: (auth: RESTAuth) => void
  namespace: string
}

export const BearerAuthForm = ({
  auth,
  setAuth,
  namespace,
}: BearerAuthFormProps) => {
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
          label="Bearer"
          namespace={`${namespace}.bearer`}
          onChange={(value) => setAuth({ ...auth, token: value })}
          value={auth.token}
        />
      </div>
    </Stack>
  )
}
