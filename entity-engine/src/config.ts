import c from 'config'

export const checkValue = <T>(configKey: string): T => {
  const value = c.get<T>(configKey)

  // Check same type as T
  if (typeof value !== typeof (<T>value)) {
    throw `${configKey} must be of type ${typeof (<T>value)}`
  }

  return value as T
}
