import { AxiosRequestConfig } from 'axios'
import * as Har from 'har-format'
import { parse } from 'qs'

import { HarRequest } from './httpsnippet'
// scotch support HAR Spec 1.2
// For more info on the spec: http://www.softwareishard.com/blog/har-12-spec/

type FieldEquals<T, K extends keyof T, Vals extends T[K][]> = {
  // eslint-disable-next-line
  [_x in K]: Vals[number]
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

const buildHarPostData = (
  req: AxiosRequestConfig
): Har.PostData | undefined => {
  const contentType = req.headers?.['content-type']
  if (!contentType) return undefined

  if ((req.data ?? '').length === 0) return undefined

  if (contentType === 'multipart/form-data') {
    throw new Error('FormData is not supported yet')
  }

  console.log('req.data', req.data)

  if (contentType === 'application/x-www-form-urlencoded') {
    const params = Object.entries(parse(req.data as string)).map(
      ([name, value]) => ({
        name,
        value,
      })
    )

    return {
      mimeType: contentType,
      params,
    } as Har.PostData
  }

  return {
    mimeType: contentType.toString(),
    text: req.data,
  }
}

export const buildHarRequest = (req: AxiosRequestConfig): HarRequest => {
  return {
    bodySize: -1, // TODO: It would be cool if we can calculate the body size
    headersSize: -1, // TODO: It would be cool if we can calculate the header size
    httpVersion: 'HTTP/1.1',
    cookies: [], // APITeam does not have formal support for Cookies as of right now
    headers: Object.entries(req.headers ?? {}).map(([name, value]) => ({
      name,
      value: value.toString(),
    })),
    method: req.method ?? '',
    queryString: Object.entries(req.params ?? {}).map(([name, value]) => ({
      name,
      value: value?.toString(),
    })),
    url: req.url ?? '',
    postData: buildHarPostData(req),
  }
}
