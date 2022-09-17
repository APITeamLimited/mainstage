import axios from 'axios'

import { getGlobetestUrl } from './upload-resource'

type RetrieveResourceArgs = {
  scopeId: string
  rawBearer: string
  resourceName: string
}

export const retrieveScopedResource = async ({
  scopeId,
  rawBearer,
  resourceName,
}: RetrieveResourceArgs) => {
  const response = await axios({
    url: `${getGlobetestUrl()}/retrieve-scoped-resource`,
    method: 'get',
    headers: {
      Authorization: `Bearer ${rawBearer}`,
      'Content-Type': 'multipart/form-data',
    },
    params: {
      scopeId,
      filename: resourceName,
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
