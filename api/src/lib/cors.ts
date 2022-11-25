import { checkValue } from 'src/config'

const gatewayUrl = checkValue<string>('gateway.url')

export const getCorsOptions = () => {
  // If environment is development, allow all origins

  if (process.env.NODE_ENV === 'development') {
    return {
      origin: '*',
    }
  }

  // If environment is production, only allow origins from the gateway
  return {
    origin: gatewayUrl,
    credentials: true,
  }
}
