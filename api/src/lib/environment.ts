import { checkValue } from 'src/config'

export const gatewayUrl = checkValue<string>('gateway.url')
