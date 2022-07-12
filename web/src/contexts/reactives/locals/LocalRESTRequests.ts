import { makeVar } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { BaseLocal } from '.'

const knownContentTypes = {
  'application/json': 'json',
  'application/ld+json': 'json',
  'application/hal+json': 'json',
  'application/vnd.api+json': 'json',
  'application/xml': 'xml',
  'application/x-www-form-urlencoded': 'multipart',
  'multipart/form-data': 'multipart',
  'text/html': 'html',
  'text/plain': 'plain',
}

type ValidContentTypes = keyof typeof knownContentTypes

type AuthBase = {
  authType: string
}

interface RESTAuthNone extends AuthBase {
  authType: 'none'
}

interface RESTAuthBasic extends AuthBase {
  authType: 'basic'

  username: string
  password: string
}

interface RESTAuthBearer extends AuthBase {
  authType: 'bearer'

  token: string
}

interface RESTAuthOAuth2 extends AuthBase {
  authType: 'oauth-2'

  token: string
  oidcDiscoveryURL: string
  authURL: string
  accessTokenURL: string
  clientID: string
  scope: string
}

interface RESTAuthAPIKey extends AuthBase {
  authType: 'api-key'

  key: string
  value: string
  addTo: string
}

type RESTAuth = { authActive: boolean } & (
  | RESTAuthNone
  | RESTAuthBasic
  | RESTAuthBearer
  | RESTAuthOAuth2
  | RESTAuthAPIKey
)

type RESTParam = {
  key: string
  value: string
  active: boolean
}

type RESTHeader = {
  key: string
  value: string
  active: boolean
}

type FormDataKeyValue = {
  key: string
  active: boolean
} & ({ isFile: true; value: Blob[] } | { isFile: false; value: string })

type RESTReqBodyFormData = {
  contentType: 'multipart/form-data'
  body: FormDataKeyValue[]
}

type RESTReqBody =
  | {
      contentType: Exclude<ValidContentTypes, 'multipart/form-data'>
      body: string
    }
  | RESTReqBodyFormData
  | {
      contentType: null
      body: null
    }

export interface LocalRESTRequest extends BaseLocal {
  __typename: 'LocalRESTRequest'
  parentId: string
  __parentTypename: 'LocalCollection' | 'LocalFolder'
  name: string
  orderingIndex: number
  method: string
  endpoint: string
  params: RESTParam[]
  headers: RESTHeader[]
  auth: RESTAuth
  body: RESTReqBody
}

type GenerateLocalRESTRequestProps = {
  parentId: string
  __parentTypename: 'LocalCollection' | 'LocalFolder'
  name?: string
  createdAt?: Date | null
  orderingIndex?: number
}

export const generateLocalRESTRequest = ({
  parentId,
  __parentTypename,
  name,
  createdAt,
  orderingIndex,
}: GenerateLocalRESTRequestProps): LocalRESTRequest => {
  return {
    id: uuidv4(),
    name: name || 'New REST Request',
    createdAt: new Date(),
    updatedAt: createdAt ? new Date() : null,
    __typename: 'LocalRESTRequest',
    parentId,
    __parentTypename,
    orderingIndex: orderingIndex || 0,
    method: 'GET',
    endpoint: '',
    params: [],
    headers: [],
    auth: {
      authActive: false,
      authType: 'none',
    },
    body: {
      contentType: null,
      body: null,
    },
  }
}

export const localRESTRequestsVar = makeVar(<LocalRESTRequest[]>[])
