import { Stack, Typography, useTheme } from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { RESTAuth, RESTAuthBearer } from 'src/contexts/reactives'

type BearerAuthFormProps = {
  auth: RESTAuthBearer & { authActive: boolean }
  setAuth: (auth: RESTAuth) => void
  requestId: string
}

export const BearerAuthForm = ({
  auth,
  setAuth,
  requestId,
}: BearerAuthFormProps) => {
  const theme = useTheme()
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
          namespace={`${requestId}.bearer`}
          onChange={(value) => setAuth({ ...auth, token: value })}
          value={auth.token}
        />
      </div>
    </Stack>
  )
}
