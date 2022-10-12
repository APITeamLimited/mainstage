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
  const contentType = response.headers['Content-Type']
    .toString()
    .toLowerCase()
    .split(';')[0]
  if (contentType) return contentType

  // Try and parse the body as JSON
  try {
    JSON.parse(parseRESTResponseBody(response))
    return 'application/json'
    // eslint-disable-next-line no-empty
  } catch (e) {}

  // Try and parse the body as XML
  try {
    const parser = new DOMParser()
    parser.parseFromString(parseRESTResponseBody(response), 'text/xml')
    return 'application/xml'
    // eslint-disable-next-line no-empty
  } catch (e) {}

  // Try and parse the body as HTML
  try {
    const parser = new DOMParser()
    parser.parseFromString(parseRESTResponseBody(response), 'text/html')
    return 'text/html'
    // eslint-disable-next-line no-empty
  } catch (e) {}

  return 'text/plain'
}

export const stripBodyStoredObjectData = (
  unfilteredBody: RESTReqBody
): RESTReqBody => {
  if (unfilteredBody.contentType === 'application/octet-stream') {
    if (unfilteredBody.body === null) {
      return unfilteredBody
    }

    return {
      contentType: unfilteredBody.contentType,
      body: {
        data: {
          ...unfilteredBody.body.data,
          data: null,
        },
        filename: unfilteredBody.body.filename,
      },
    }
  }

  if (unfilteredBody.contentType === 'multipart/form-data') {
    return {
      contentType: unfilteredBody.contentType,
      body: unfilteredBody.body.map((part) => {
        if (part.fileField) {
          return {
            ...part,
            fileField: {
              ...part.fileField,
              data: {
                ...part.fileField.data,
                data: null,
              },
            },
          }
        } else {
          return part
        }
      }),
    }
  }

  return unfilteredBody
}
