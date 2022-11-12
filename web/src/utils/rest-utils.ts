import { RESTReqBody } from '@apiteam/types/src'
import { Response } from 'k6/http'

export const parseRESTResponseBody = (response: Response): string => {
  if (typeof response.body === 'string') {
    return response.body
  } else {
    return String(response.body)
  }
}

export const getBodyContentType = (response: Response) => {
  const contentTypeRaw = Object.entries(response.headers).find(([key, value]) =>
    key.toLowerCase().includes('content-type')
  )

  if (contentTypeRaw) {
    return contentTypeRaw[1].toString().toLowerCase().split(';')[0]
  }

  // Try and parse the body as JSON
  try {
    JSON.parse(parseRESTResponseBody(response))
    return 'application/json'
    // eslint-disable-next-line no-empty
  } catch {}

  // Try and parse the body as HTML
  try {
    const parser = new DOMParser()
    parser.parseFromString(parseRESTResponseBody(response), 'text/html')
    return 'text/html'
    // eslint-disable-next-line no-empty
  } catch {}

  return 'text/plain'
}

export const stripBodyStoredObjectData = (
  unfilteredBody: RESTReqBody
): RESTReqBody => {
  return unfilteredBody

  // TODO: Re-enable if file uploads are re-enabled

  // if (unfilteredBody.contentType === 'application/octet-stream') {
  //   if (unfilteredBody.body === null) {
  //     return unfilteredBody
  //   }

  //   return {
  //     contentType: unfilteredBody.contentType,
  //     body: {
  //       data: {
  //         ...unfilteredBody.body.data,
  //         data: null,
  //       },
  //       filename: unfilteredBody.body.filename,
  //     },
  //   }
  // }

  // if (unfilteredBody.contentType === 'multipart/form-data') {
  //   return {
  //     contentType: unfilteredBody.contentType,
  //     body: unfilteredBody.body.map((part) => {
  //       if (part.fileField) {
  //         return {
  //           ...part,
  //           fileField: {
  //             ...part.fileField,
  //             data: {
  //               ...part.fileField.data,
  //               data: null,
  //             },
  //           },
  //         }
  //       } else {
  //         return part
  //       }
  //     }),
  //   }
  // }

  // return unfilteredBody
}
