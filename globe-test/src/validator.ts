import {
  ExecutionParams,
  RESTRequest,
  WrappedExecutionParams,
} from '@apiteam/types'
import Ajv, { JSONSchemaType } from 'ajv'
import { ParsedQuery } from 'query-string'

const ajv = new Ajv()

const schema = {
  type: 'object',
  properties: {
    bearer: { type: 'string' },
    projectId: { type: 'string' },
    branchId: { type: 'string' },
    source: { type: 'string' },
    sourceName: { type: 'string' },
    scopeId: { type: 'string' },
    environmentContext: {
      type: 'object',
      //properties: {
      //  variables: {
      //    type: 'array',
      //    items: {
      //      type: 'object',
      //      properties: {
      //        key: { type: 'string' },
      //        value: { type: 'string' },
      //      },
      //      required: ['key', 'value'],
      //      additionalProperties: false,
      //    },
      //  },
      //},
      //required: ['variables'],
      //additionalProperties: false,
    },
    collectionContext: {
      type: 'object',
      //properties: {
      //  variables: {
      //    type: 'array',
      //    items: {
      //      type: 'object',
      //      properties: {
      //        key: { type: 'string' },
      //        value: { type: 'string' },
      //      },
      //      required: ['key', 'value'],
      //      additionalProperties: false,
      //    },
      //  },
      //},
      //required: ['variables'],
      //additionalProperties: false,
    },
    restRequest: {
      type: 'object',
      //properties: {
      //  method: { type: 'string' },
      //  url: { type: 'string' },
      //  body: { type: 'any' },
      //  params: { type: 'any' },
      //},
      //required: ['method', 'url', 'body', 'params'],
      //additionalProperties: false,
    },
    testType: { type: 'string' },
    collectionId: { type: 'string' },
    underlyingRequest: { type: 'object' },
  },
  required: [
    'bearer',
    'projectId',
    'branchId',
    'source',
    'sourceName',
    'scopeId',
    'environmentContext',
    'collectionContext',
    'restRequest',
    'testType',
    'collectionId',
    'underlyingRequest',
  ],
}

const validate = ajv.compile(schema)

export const validateParams = (
  params: ParsedQuery<string>
): WrappedExecutionParams => {
  // Try and parse the params
  const parsedParams = Object.entries(params).reduce(
    (acc, [key, value]) => {
      try {
        return {
          ...acc,
          [key]: JSON.parse(value as string),
        }
      } catch (e) {
        return {
          ...acc,
          [key]: value,
        }
      }
    },
    {
      environmentContext: {},
      collectionContext: {},
      restRequest: null,
    }
  ) as unknown

  if (!validate(parsedParams)) {
    throw new Error('Invalid params')
  }

  const restRequest = (
    params.restRequest ? JSON.parse(params.restRequest as string) : null
  ) as WrappedExecutionParams['restRequest'] | null

  // Sufficiently checked for strings so we can cast
  const baseParams = {
    id: params.id as string,
    source: params.source as string,
    sourceName: params.sourceName as string,
    scopeId: params.scopeId as string,
    environmentContext: JSON.parse(params.environmentContext as string) as {
      variables: { key: string; value: string }[]
    } | null,
    collectionContext: JSON.parse(params.collectionContext as string) as {
      variables: { key: string; value: string }[]
    } | null,
    restRequest,
    bearer: params.bearer as string,
    projectId: params.projectId as string,
    branchId: params.branchId as string,
  }

  if (params.testType === 'rest') {
    if (typeof params?.collectionId !== 'string') {
      throw new Error(`Parameter collectionId is required for rest tests`)
    }

    if (typeof params?.underlyingRequest !== 'string') {
      throw new Error(`Parameter underlyingRequest is required for rest tests`)
    }

    return {
      ...baseParams,
      testType: 'rest',
      collectionId: params.collectionId as string,
      underlyingRequest: JSON.parse(
        params.underlyingRequest as string
      ) as RESTRequest,
    }
  }

  throw new Error(`Invalid testType parameter`)
}
