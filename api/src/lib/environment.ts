import { checkValue } from '../config'

export const gatewayUrl = checkValue<string>('gateway.url')
