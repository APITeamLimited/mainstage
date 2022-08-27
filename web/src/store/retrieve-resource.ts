import axios from 'axios'

const storeUrl =
  process.env['NODE_ENV'] === 'production'
    ? `${process.env['GATEWAY_URL']}/api/store`
    : `http://${process.env['STORE_HOST']}:${process.env['STORE_PORT']}/api/store`

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
    url: `${storeUrl}/retrieve-scoped-resource`,
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
