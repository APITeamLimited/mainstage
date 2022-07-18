import { Box, Stack } from '@mui/material'

import { EnvironmentTextField } from '../../EnvironmentManager/EnvironmentTextField'

import { RequestMethodButton } from './RequestMethodButton'

type EndpointBoxProps = {
  unsavedEndpoint: string
  setUnsavedEndpoint: (endpoint: string) => void
  requestMethod: string
  setRequestMethod: (requestMethod: string) => void
  requestId: string
}

export const EndpointBox = ({
  unsavedEndpoint,
  setUnsavedEndpoint,
  requestMethod,
  setRequestMethod,
  requestId,
}: EndpointBoxProps) => {
  const handleEndpointChange = (
    newValue: string,
    returnedNamespace: string
  ) => {
    if (namespace === returnedNamespace) {
      setUnsavedEndpoint(newValue)
    } else {
      console.log('skipping endpoint change', namespace, returnedNamespace)
    }
  }

  const namespace = `${requestId}_endpoint`
  return (
    <>
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
        <EnvironmentTextField
          placeholder="Endpoint"
          namespace={namespace}
          value={unsavedEndpoint}
          onChange={handleEndpointChange}
          contentEditableStyles={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        />
      </Stack>
    </>
  )
}
