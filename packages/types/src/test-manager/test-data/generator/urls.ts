import isValidDomain from 'is-valid-domain'

import { PathVariables } from '../../../entities'

const ipV4Regex = new RegExp(
  '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
)

const ipV6Regex = new RegExp(
  '(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))'
)

const privateIPRegex = new RegExp(
  /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/
)

export const validateURL = (url: string): string | null => {
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
  const urlWithoutTrailingSlash = strippedUrl.split('/')[0]

  // Check if valid ip address or domain
  if (
    !(extractLocalhost(urlWithoutTrailingSlash) === 'localhost') &&
    !ipV4Regex.test(urlWithoutTrailingSlash) &&
    !ipV6Regex.test(urlWithoutTrailingSlash) &&
    !isValidDomain(urlWithoutTrailingSlash)
  ) {
    return null
  }

  return substituteURLShortcuts(formattedUrl)
}

export const validateURLStrict = (url: string | undefined): string => {
  if (!url) {
    throw new Error('Please provide a URL')
  }

  const validUrl = validateURL(url)

  if (validUrl === null) {
    throw new Error(`Invalid URL: ${url}`)
  }

  return validUrl
}

export const determineIfLocalhost = (url: string) => {
  // Remove protocol from url
  const strippedUrl = url.replace(/(^\w+:|^)\/\//, '')

  // Remove trailing slash from url
  const urlWithoutTrailingSlash = strippedUrl.split('/')[0]

  // Check how many colons are in the url
  const colons = urlWithoutTrailingSlash.split(':').length - 1

  if (colons > 1) {
    throw new Error('Invalid URL, too many colons')
  }

  // Remove port from url if present
  const urlWithoutPort = urlWithoutTrailingSlash.split(':')[0]

  if (isValidDomain(urlWithoutPort)) return false

  if (urlWithoutPort === 'localhost') return true

  return privateIPRegex.test(urlWithoutPort)
}

const extractLocalhost = (url: string): string => {
  if (url.includes(':')) {
    return url.split(':')[0]
  }

  return url
}

const substituteURLShortcuts = (rawURL: string): string => {
  // If request url is localhost, replace with the local server url

  const url = new URL(rawURL)

  if (url.hostname === 'localhost') {
    return `${url.protocol}//127.0.0.1:${url.port}${url.pathname}`
  }

  return rawURL
}

export const substitutePathVariables = (
  endpoint: string,
  pathVariables: PathVariables
): string => {
  // Extract protocol http or https from endpoint (2 // are required)
  const protocol = endpoint.includes('://') ? endpoint.split('://')[0] : ''

  // Remove protocol from endpoint
  const endpointWithoutProtocol = endpoint.replace(`${protocol}://`, '')

  // Split the endpoint into 2 parts aat first '/'
  const parts = endpointWithoutProtocol.split('/')
  const firstPart = parts[0]
  const rest = parts.slice(1).join('/')

  const pathSection = rest.replace(
    /:([a-zA-Z0-9-_]+)/g,
    (_, p1) =>
      pathVariables.find((pathVariable) => pathVariable.keyString === p1)
        ?.value || '1'
  )

  const formattedProtocolPart = protocol ? `${protocol}://` : ''

  return `${formattedProtocolPart}${firstPart}${
    pathSection.length > 0 ? '/' : ''
  }${pathSection}`
}
