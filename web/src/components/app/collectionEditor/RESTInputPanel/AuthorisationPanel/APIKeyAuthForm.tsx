import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { RESTAuth, RESTAuthAPIKey } from 'src/contexts/reactives'

type APIKeyAuthFormProps = {
  auth: RESTAuthAPIKey & { authActive: boolean }
  setAuth: (auth: RESTAuth) => void
  requestId: string
}

export const APIKeyAuthForm = ({
  auth,
  setAuth,
  requestId,
}: APIKeyAuthFormProps) => {
  return (
    <Stack
      alignItems="flex-start"
      spacing={2}
      sx={{
        width: '100%',
      }}
    >
      <EnvironmentTextField
        label="Key"
        namespace={`${requestId}.apiKey`}
        onChange={(value) => setAuth({ ...auth, key: value })}
        value={auth.key}
      />
      <EnvironmentTextField
        label="Value"
        namespace={`${requestId}.apiKeyValue`}
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
          <FormControlLabel
            value="header"
            control={<Radio />}
            label="Headers"
          />
          <FormControlLabel
            value="query"
            control={<Radio />}
            label="Query Parameters"
          />
        </RadioGroup>
      </div>
    </Stack>
  )
}
