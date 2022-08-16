import c from 'config'

export const checkValue = <T>(configKey: string): T => {
  let value = c.get(configKey)
  const stringValue = String(value)

  // if value begins with '${' and ends with '}' then it is a config value
  if (stringValue.startsWith('$') && stringValue.endsWith('}')) {
    const sysValue =
      process.env[stringValue.substring(2, stringValue.length - 1)]
    if (sysValue) {
      value = sysValue
    }
  }

  // Check same type as T
  if (typeof value !== typeof (<T>value)) {
    throw `${configKey} must be of type ${typeof (<T>value)}`
  }

  return value as T
}
