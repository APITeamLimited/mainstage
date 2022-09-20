import { KeyValueItem, StoredObject } from '..'

import { BaseEntity } from '.'

export const knownContentTypes = {
  'application/json': 'json',
  //'application/ld+json': 'json',
  //'application/hal+json': 'json',
  //'application/vnd.api+json': 'json',
  'application/xml': 'xml',
  'application/x-www-form-urlencoded': 'multipart',
  'multipart/form-data': 'multipart',
  'text/html': 'html',
  'text/plain': 'plain',
}

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
//| RESTInheritAuth

export type FormDataKeyValue = {
  id: number
  keyString: string
  enabled: boolean
} & (
  | { isFile: true; value: StoredObject<string>; fileName: string }
  | { isFile: false; value: string }
)

export type RESTReqBodyFormData = {
  contentType: 'multipart/form-data'
  body: FormDataKeyValue[]
}

export type RESTReqBody =
  | {
      contentType: Exclude<
        ValidContentTypes,
        'multipart/form-data' | 'application/x-www-form-urlencoded' | null
      >
      body: string
    }
  | RESTReqBodyFormData
  | {
      contentType: null
      body: null
    }
  | {
      contentType: 'application/x-www-form-urlencoded'
      body: KeyValueItem[]
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
}
