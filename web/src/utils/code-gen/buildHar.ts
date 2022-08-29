import * as Har from 'har-format'
import { RESTRequest } from 'types/src'

import { HarRequest } from './httpsnippet'
// scotch support HAR Spec 1.2
// For more info on the spec: http://www.softwareishard.com/blog/har-12-spec/

type FieldEquals<T, K extends keyof T, Vals extends T[K][]> = {
  // eslint-disable-next-line
  [_x in K]: Vals[number]
}

const buildHarHeaders = (req: RESTRequest): Har.Header[] => {
  return req.headers
    .filter((header) => header.enabled)
    .map((header) => ({
      name: header.keyString,
      value: header.value,
    }))
}

const buildHarQueryStrings = (req: RESTRequest): Har.QueryString[] => {
  return req.params
    .filter((param) => param.enabled)
    .map((param) => ({
      name: param.keyString,
      value: param.value,
    }))
}

const buildHarPostParams = (
  req: RESTRequest &
    FieldEquals<RESTRequest, 'method', ['POST', 'PUT']> & {
      body: {
        contentType: 'application/x-www-form-urlencoded' | 'multipart/form-data'
      }
    }
): Har.Param[] => {
  throw new Error('FormData is not supported yet')
  // URL Encoded strings have a string style of contents
  if (req.body.contentType === 'application/x-www-form-urlencoded') {
    return pipe(
      req.body.body,
      S.split('\n'),
      RA.map(
        flow(
          // Define how each lines are parsed

          S.split(':'), // Split by ":"
          RA.map(S.trim), // Remove trailing spaces in key/value begins and ends
          ([key, value]) => ({
            // Convert into a proper key value definition
            name: key,
            value: value ?? '', // Value can be undefined (if no ":" is present)
          })
        )
      ),
      RA.toArray
    )
  } else {
    // FormData has its own format
    return req.body.body.flatMap((entry) => {
      if (entry.isFile) {
        // We support multiple files
        return entry.value.map(
          (file) =>
            <Har.Param>{
              name: entry.key,
              fileName: entry.key, // TODO: Blob doesn't contain file info, anyway to bring file name here ?
              contentType: file.type,
            }
        )
      } else {
        return {
          name: entry.key,
          value: entry.value,
        }
      }
    })
  }
}

const buildHarPostData = (req: RESTRequest): Har.PostData | undefined => {
  if (!req.body.contentType) {
    return {
      mimeType: '',
      text: '',
    }
  }

  if (
    req.body.contentType === 'application/x-www-form-urlencoded' ||
    req.body.contentType === 'multipart/form-data'
  ) {
    throw new Error('FormData is not supported yet')
    return {
      mimeType: req.body.contentType, // By default assume JSON ?
      params: buildHarPostParams(req as any),
    }
  }

  return {
    mimeType: req.body.contentType, // Let's assume by default content type is JSON
    text: req.body.body,
  }
}

export const buildHarRequest = (req: RESTRequest): HarRequest => {
  return {
    bodySize: -1, // TODO: It would be cool if we can calculate the body size
    headersSize: -1, // TODO: It would be cool if we can calculate the header size
    httpVersion: 'HTTP/1.1',
    cookies: [], // scotch does not have formal support for Cookies as of right now
    headers: buildHarHeaders(req),
    method: req.method,
    queryString: buildHarQueryStrings(req),
    url: req.endpoint,
    postData: buildHarPostData(req),
  }
}
