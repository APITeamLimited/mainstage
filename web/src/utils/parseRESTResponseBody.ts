import { Response } from 'k6/http'

export const parseRESTResponseBody = (response: Response): string => {
  if (typeof response.body === 'string') {
    return response.body
  } else {
    return JSON.stringify(response.body, null, 2)
  }
}
