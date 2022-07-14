import {
  Button,
  ButtonGroup,
  InputAdornment,
  Stack,
  OutlinedInput,
  TextField,
  useTheme,
  Typography,
} from '@mui/material'

import { RequestMethodButton } from './RequestMethodButton'

type EndpointBoxProps = {
  unsavedEndpoint: string
  setUnsavedEndpoint: (endpoint: string) => void
  requestMethod: string
  setRequestMethod: (requestMethod: string) => void
}

export const EndpointBox = ({
  unsavedEndpoint,
  setUnsavedEndpoint,
  requestMethod,
  setRequestMethod,
}: EndpointBoxProps) => {
  const theme = useTheme()

  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
      }}
    >
      <RequestMethodButton
        requestMethod={requestMethod}
        setRequestMethod={setRequestMethod}
      />
      <TextField
        fullWidth
        placeholder="Endpoint"
        value={unsavedEndpoint}
        onChange={(event) => setUnsavedEndpoint(event.target.value)}
        size="small"
        color="secondary"
        sx={{
          fieldset: {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          },
          paddingLeft: 0,
        }}
      />
    </Stack>
  )
}
