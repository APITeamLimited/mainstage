/* eslint-disable @typescript-eslint/no-explicit-any */
import { DefaultMetrics, StoredObject } from '@apiteam/types'
import { Response } from 'k6/http'

import { uploadScopedResource } from 'src/store'

export const uploadResponse = async (
  response: Response,
  scopeId: string,
  rawBearer: string,
  responseId: string
): Promise<StoredObject<Response>> => {
  const blob = new Blob([JSON.stringify(response)], {
    type: 'application/json',
  })

  const storeReceipt = await uploadScopedResource({
    scopeId,
    rawBearer,
    resource: blob,
    resourceName: `RESTResponse:${responseId}:response.json`,
  })

  return {
    __typename: 'StoredObject',
    storeReceipt,
    data: null,
  }
}

export const uploadMetrics = async (
  metrics: DefaultMetrics,
  scopeId: string,
  rawBearer: string,
  responseId: string
): Promise<StoredObject<DefaultMetrics>> => {
  const blob = new Blob([JSON.stringify(metrics)], {
    type: 'application/json',
  })

  const storeReceipt = await uploadScopedResource({
    scopeId,
    rawBearer,
    resource: blob,
    resourceName: `RESTResponse:${responseId}:metrics.json`,
  })

  return {
    __typename: 'StoredObject',
    storeReceipt,
    data: null,
  }
}
