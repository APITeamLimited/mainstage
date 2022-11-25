const ipV4Regex = new RegExp(
  '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
)

const ipV6Regex = new RegExp(
  '(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))'
)

export const validateURL = async (url: string): Promise<string | null> => {
  const isValidDomain = await import('is-valid-domain').then(
    (module) => module.default
  )

  let formattedUrl = url

  if (!url.startsWith('http') && !url.startsWith('https')) {
    if (
      ipV4Regex.test(url) ||
      ipV6Regex.test(url) ||
      url.split('/')[0] === 'localhost'
    ) {
      formattedUrl = `http://${url}`
    } else if (isValidDomain(formattedUrl)) {
      formattedUrl = `https://${url}`
    } else {
      return null
    }
  }

  // Remove protocol from url
  const strippedUrl = formattedUrl.replace(/(^\w+:|^)\/\//, '')

  // Check if valid ip address or domain
  if (
    !(strippedUrl.split('/')[0] === 'localhost') &&
    !ipV4Regex.test(strippedUrl) &&
    !ipV6Regex.test(strippedUrl) &&
    !isValidDomain(strippedUrl)
  ) {
    return null
  }

  return formattedUrl
}
