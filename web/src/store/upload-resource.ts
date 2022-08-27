import axios from 'axios'

const storeUrl =
  process.env['NODE_ENV'] === 'production'
    ? `${process.env['GATEWAY_URL']}/api/store`
    : `http://${process.env['STORE_HOST']}:${process.env['STORE_PORT']}/api/store`

type UploadResourceType = {
  scopeId: string
  token: string
  resource: Blob
  resourceName: string
}

export const uploadResource = async ({
  scopeId,
  token,
  resource,
  resourceName,
}: UploadResourceType) => {
  const form = new FormData()
  form.append(resourceName, resource, resourceName)

  console.log('storeUrl', storeUrl)

  const response = await axios({
    url: `${storeUrl}/submit-scoped-resource`,
    method: 'post',
    data: form,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    params: {
      scopeId,
    },
  })

  if (response.status !== 200) {
    throw new Error(response.data)
  }

  const storeReceipt = response.data[resourceName]

  if (!storeReceipt) {
    throw new Error('No store receipt')
  }

  return storeReceipt as string
}
