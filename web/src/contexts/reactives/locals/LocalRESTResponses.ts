import { makeVar } from '@apollo/client'
import { BaseEntity, LocalRESTRequest } from 'web/src/contexts/reactives/locals'

type DiscreteResults =
  | { type: 'Loading'; request: LocalRESTRequest }
  | {
      type: 'Fail'
      headers: { key: string; value: string | string[] }[]
      body: ArrayBuffer
      statusCode: number

      meta: {
        responseSize: number // in bytes
        responseDuration: number // in millis
      }

      request: LocalRESTRequest
    }
  | {
      type: 'NetworkFail'
      error: Error

      request: LocalRESTRequest
    }
  | {
      type: 'ScriptFail'
      error: Error
    }
  | {
      type: 'Success'
      headers: { key: string; value: string | string[] }[]
      body: ArrayBuffer
      statusCode: number
      meta: {
        responseSize: number // in bytes
        responseDuration: number // in millis
      }

      request: LocalRESTRequest
    }

interface LocalRESTResponseBase extends BaseEntity {
  __typename: 'LocalRESTResponse'
  parentId: string
  __parentTypename: 'LocalRESTRequest'
  name: string
}

export type LocalRESTResponse = LocalRESTResponseBase & DiscreteResults

export const localRESTResponsesVar = makeVar(<LocalRESTResponse[]>[])
