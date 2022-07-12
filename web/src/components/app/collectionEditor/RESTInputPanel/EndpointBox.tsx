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

type EndpointBoxProps = {
  unsavedEndpoint: string
  setUnsavedEndpoint: (endpoint: string) => void
}

export const EndpointBox = ({
  unsavedEndpoint,
  setUnsavedEndpoint,
}: EndpointBoxProps) => {
  const theme = useTheme()

  return (
    <Stack
      direction="row"
      sx={{
        width: '100%',
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        sx={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        s
      </Button>
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
