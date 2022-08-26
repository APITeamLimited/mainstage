import { checkValue } from 'src/config'

const INTERNAL_API_KEY = checkValue<string>('api.internalAPIKey')

export const checkInternal = (internalAPIKey: string) => {
  if (internalAPIKey !== INTERNAL_API_KEY) {
    throw new Error('Invalid internal API key')
  }
}
