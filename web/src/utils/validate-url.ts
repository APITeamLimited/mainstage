const ipV4Regex = new RegExp(
  '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
)

const ipV6Regex = new RegExp(
  '(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))'
)

const extractLocalhost = (url: string): string => {
  if (url.includes(':')) {
    return url.split(':')[0]
  }

  return url
}

export const validateURL = async (url: string): Promise<string | null> => {
  const isValidDomain = await import('is-valid-domain').then(
    (module) => module.default
  )

  let formattedUrl = url

  if (!url.startsWith('http') && !url.startsWith('https')) {
    const noTrailingUrl = url.endsWith('/') ? url.slice(0, -1) : url
    if (
      ipV4Regex.test(noTrailingUrl) ||
      ipV6Regex.test(noTrailingUrl) ||
      extractLocalhost(noTrailingUrl) === 'localhost'
    ) {
      formattedUrl = `http://${url}`
    } else if (isValidDomain(url.endsWith('/') ? url.slice(0, -1) : url)) {
      formattedUrl = `https://${url}`
    } else {
      return null
    }
  }

  // Remove protocol from url
  const strippedUrl = formattedUrl.replace(/(^\w+:|^)\/\//, '')

  // Remove trailing slash from url
  const urlWithoutTrailingSlash = strippedUrl.endsWith('/')
    ? strippedUrl.slice(0, -1)
    : strippedUrl

  // Check if valid ip address or domain
  if (
    !(extractLocalhost(urlWithoutTrailingSlash) === 'localhost') &&
    !ipV4Regex.test(urlWithoutTrailingSlash) &&
    !ipV6Regex.test(urlWithoutTrailingSlash) &&
    !isValidDomain(urlWithoutTrailingSlash)
  ) {
    return null
  }

  return formattedUrl
}
