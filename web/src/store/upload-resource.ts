import axios from 'axios'

export const getGlobetestUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    const host = process.env['STORE_HOST']
    const port = process.env['STORE_PORT']

    if (!(host && port)) {
      throw new Error(
        `STORE_HOST and STORE_PORT must be set, got ${host} and ${port}`
      )
    }

    return `http://${process.env['STORE_HOST']}:${process.env['STORE_PORT']}/api/store`
  } else {
    // Get current domain
    const domain = window.location.hostname
    return `https://${domain}/api/store`
  }
}

type UploadResourceArgs = {
  scopeId: string
  rawBearer: string
  resource: Blob
  resourceName: string
}

export const uploadResource = async ({
  scopeId,
  rawBearer,
  resource,
  resourceName,
}: UploadResourceArgs) => {
  const form = new FormData()
  form.append(resourceName, resource, resourceName)

  const response = await axios({
    url: `${getGlobetestUrl()}/submit-scoped-resource`,
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

  const storeReceipt = response.data.filename

  if (!storeReceipt) {
    throw new Error('No store receipt')
  }

  return storeReceipt as string
}
