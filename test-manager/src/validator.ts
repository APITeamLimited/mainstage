import {
  ExecutionParams,
  RESTRequest,
  WrappedExecutionParams,
  wrappedExecutionParamsSchema,
} from '@apiteam/types'
import Ajv from 'ajv'
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
      type: ['object', 'null'],
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
      type: ['object', 'null'],
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
    finalRequest: {
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
    'finalRequest',
    'testType',
    'collectionId',
    'underlyingRequest',
    'collectionContext',
    'environmentContext',
  ],
}

const validate = ajv.compile(schema)

// TODO: Migrate to zod
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
      finalRequest: null,
    }
  ) as unknown

  if (!validate(parsedParams)) {
    throw new Error('Invalid params')
  }

  const finalRequest = (
    params.finalRequest ? JSON.parse(params.finalRequest as string) : null
  ) as WrappedExecutionParams['finalRequest'] | null

  // Sufficiently checked for strings so we can cast
  const baseParams = {
    id: params.id as string,
    source: params.source as string,
    sourceName: params.sourceName as string,
    scopeId: params.scopeId as string,
    environmentContext: JSON.parse(
      params.environmentContext as string
    ) as ExecutionParams['environmentContext'],
    collectionContext: JSON.parse(
      params.collectionContext as string
    ) as ExecutionParams['collectionContext'],
    finalRequest,
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
