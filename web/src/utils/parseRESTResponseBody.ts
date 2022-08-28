import { Response } from 'k6/http'

export const parseRESTResponseBody = (response: Response): string => {
  if (typeof response.body === 'string') {
    return response.body
  } else {
    return JSON.stringify(response.body, null, 2)
    //const res = new TextDecoder('utf-8').decode(response.body)
    // HACK: Temporary trailing null character issue from the extension fix
    //return res.replace(/\0+$/, '')
  }
}
