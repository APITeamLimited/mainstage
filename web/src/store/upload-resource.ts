import axios from 'axios'

const storeUrl =
  process.env['NODE_ENV'] === 'production'
    ? `${process.env['GATEWAY_URL']}/api/store`
    : `${process.env['GATEWAY_URL']}:${process.env['GATEWAY_PORT']}/api/store`

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
  form.append(resourceName, resource)

  const response = await axios.post(
    `${storeUrl}/submit-scoped-resource`,
    form,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        scopeId,
        token,
      },
    }
  )

  if (response.status !== 200) {
    throw new Error(response.data)
  }

  const storeReceipt = response.data[resourceName]

  if (!storeReceipt) {
    throw new Error('No store receipt')
  }

  return storeReceipt as string
}
