import axios from 'axios'

import { getStoreUrl } from './upload-scoped-resource'

type RetrieveResourceArgs = {
  scopeId: string
  rawBearer: string
  storeReceipt: string
}

export const retrieveScopedResource = async ({
  scopeId,
  rawBearer,
  storeReceipt,
}: RetrieveResourceArgs) => {
  const response = await axios({
    url: `${getStoreUrl()}/retrieve-scoped-resource`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${rawBearer}`,
      'Content-Type': 'multipart/form-data',
    },
    params: {
      scopeId,
      storeReceipt,
    },
  })

  if (response.status !== 200) {
    throw new Error(response.statusText)
  }

  return {
    data: response.data,
    contentType: response.headers['content-type'].split(';')[0],
  }
}
