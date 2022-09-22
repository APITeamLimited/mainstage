import { KeyValueItem, StoredObject } from '..'

import { BaseEntity } from '.'

const knownContentTypes = {
  'application/json': 'JSON',
  //'application/ld+json': 'json',
  //'application/hal+json': 'json',
  //'application/vnd.api+json': 'json',
  'application/xml': 'XML',
  'application/x-www-form-urlencoded': 'Form URL Encoded',
  'multipart/form-data': 'Form Data',
  'text/html': 'HTML',
  'text/plain': 'Plain',
  'application/octet-stream': 'File',
  none: 'None',
} as const

export const getKnownContentTypes = () => Object.keys(knownContentTypes)
export const getPrettyContentTypes = () => Object.values(knownContentTypes)

export type ValidContentTypes = keyof typeof knownContentTypes | null

type AuthBase = {
  authType: string
}

export interface RESTAuthInherit extends AuthBase {
  authType: 'inherit'
}

export interface RESTAuthNone extends AuthBase {
  authType: 'none'
}

export interface RESTAuthBasic extends AuthBase {
  authType: 'basic'

  username: string
  password: string
}

export interface RESTAuthBearer extends AuthBase {
  authType: 'bearer'

  token: string
}

export interface RESTAuthOAuth2 extends AuthBase {
  authType: 'oauth-2'

  token: string
  oidcDiscoveryURL: string
  authURL: string
  accessTokenURL: string
  clientID: string
  scope: string
}

export interface RESTAuthAPIKey extends AuthBase {
  authType: 'api-key'

  key: string
  value: string
  addTo: 'header' | 'query'
}

export interface RESTInheritAuth extends AuthBase {
  authType: 'inherit'
}

export type RESTAuth =
  | RESTAuthInherit
  | RESTAuthNone
  | RESTAuthBasic
  | RESTAuthBearer
  | RESTAuthOAuth2
  | RESTAuthAPIKey

export type RESTReqBody =
  | {
      contentType: Exclude<
        ValidContentTypes,
        | 'multipart/form-data'
        | 'application/x-www-form-urlencoded'
        | 'application/octet-stream'
        | null
      >
      body: string
    }
  | {
      contentType: 'none'
      body: null
    }
  | {
      contentType: 'application/x-www-form-urlencoded' | 'multipart/form-data'
      body: KeyValueItem[]
    }
  | {
      contentType: 'application/octet-stream'
      body: {
        data: StoredObject<string | ArrayBuffer>
        filename: string
      } | null
    }

export interface RESTRequest extends BaseEntity {
  __typename: 'RESTRequest'
  parentId: string
  __parentTypename: 'Collection' | 'Folder'
  name: string
  orderingIndex: number
  method: string
  endpoint: string
  params: KeyValueItem[]
  headers: KeyValueItem[]
  auth: RESTAuth
  body: RESTReqBody
  description: string
  pathVariables: KeyValueItem[]
}
