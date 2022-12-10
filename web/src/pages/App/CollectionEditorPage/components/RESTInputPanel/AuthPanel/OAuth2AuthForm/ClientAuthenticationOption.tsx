import { CustomFormRadioGroup } from 'src/components/custom-mui'

type ClientAuthenticationOptionProps = {
  value: 'header' | 'body'
  onChange: (value: 'header' | 'body') => void
}

export const ClientAuthenticationOption = ({
  value,
  onChange,
}: ClientAuthenticationOptionProps) => (
  <CustomFormRadioGroup
    label="Send Client Authentication in"
    name="clientAuthentication"
    onChange={(event) => {
      if (event.target.value === 'header' || event.target.value === 'body') {
        onChange(event.target.value)
      } else {
        throw new Error('Invalid client authentication type')
      }
    }}
    value={value}
    options={[
      {
        label: 'Basic Auth header',
        value: 'header',
      },
      {
        label: 'Client Credentials in body',
        value: 'body',
      },
    ]}
  />
)
