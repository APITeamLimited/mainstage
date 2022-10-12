import { EnvironmentTextField } from 'src/components/app/EnvironmentManager/EnvironmentTextField'

import { RequestMethodButton } from '../RequestMethodButton'

import { IsVerifiedDomainBadge } from './IsVerifiedDomainBadge'

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
      <RequestMethodButton
        requestMethod={requestMethod}
        setRequestMethod={setRequestMethod}
      />
      <EnvironmentTextField
        placeholder="Endpoint"
        namespace={namespace}
        value={unsavedEndpoint}
        onChange={(v, m) => handleEndpointChange(v, m)}
        wrapperStyles={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
        contentEditableStyles={{
          height: '40px',
        }}
        innerRightArea={<IsVerifiedDomainBadge endpoint={unsavedEndpoint} />}
      />
    </>
  )
}
