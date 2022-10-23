import { Box, Stack } from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { useSimplebarReactModule } from 'src/contexts/imports'
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
      </SimpleBar>
    </Box>
  )
}
