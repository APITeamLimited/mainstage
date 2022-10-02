import axios from 'axios'
import FormData from 'form-data'

import { checkValue } from '../config'

export const STORE_URL = `http://${checkValue<string>(
  'store.host'
)}:${checkValue<number>('store.port')}/api/store`

type UploadResourceArgs = {
  scopeId: string
  rawBearer: string
  resource: Buffer
  resourceName: string
}

export const uploadScopedResource = async ({
  scopeId,
  rawBearer,
  resource,
  resourceName,
}: UploadResourceArgs) => {
  const form = new FormData()
  form.append(resourceName, resource, resourceName)

  const response = await axios({
    url: `${STORE_URL}/submit-scoped-resource`,
    method: 'post',
    data: form,
    headers: {
      Authorization: `Bearer ${rawBearer}`,
      'Content-Type': 'multipart/form-data',
    },
    params: {
      scopeId,
    },
  })

  if (response.status !== 201) {
    throw new Error(response.data)
  }

  const storeReceipt = response.data.storeReceipt

  if (!storeReceipt) {
    throw new Error('No store receipt')
  }

  return storeReceipt as string
}
