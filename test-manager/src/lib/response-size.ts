import type { Response } from 'k6/http'

export const estimateRESTResponseSize = (response: Response): number => {
  // Create dummy response object to calculate the size of the response
  const dummyResponse = `HTTP/1.1 ${response.status} ${response.status_text}
  ${Object.entries(response.headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\r')}

  ${response.body?.toString()}`

  return Buffer.byteLength(dummyResponse, 'utf8')
}
