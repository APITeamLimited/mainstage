import { RESTAuth, RESTAuthAPIKey } from '@apiteam/types/src'
import {
  Box,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { useSimplebarReactModule } from 'src/contexts/imports'

type APIKeyAuthFormProps = {
  auth: RESTAuthAPIKey
  setAuth: (auth: RESTAuth) => void
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
          }}
        >
          <div
            style={{
              width: '100%',
            }}
          >
            <EnvironmentTextField
              label="Key"
              namespace={`${namespace}.apiKey`}
              onChange={(value) => setAuth({ ...auth, key: value })}
              value={auth.key}
            />
          </div>
          <div
            style={{
              width: '100%',
            }}
          >
            <EnvironmentTextField
              label="Value"
              namespace={`${namespace}.apiKeyValue`}
              onChange={(value) => setAuth({ ...auth, value })}
              value={auth.value}
            />
          </div>
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
                sx={{
                  '& .MuiFormControlLabel-label': {
                    userSelect: 'none',
                  },
                }}
              />
              <FormControlLabel
                value="query"
                control={<Radio />}
                label="Query Parameters"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    userSelect: 'none',
                  },
                }}
              />
            </RadioGroup>
          </div>
        </Stack>
      </SimpleBar>
    </Box>
  )
}
