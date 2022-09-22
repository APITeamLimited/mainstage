import { parse } from 'querystring'

import { ImportRequest } from 'insomnia-importers'
import * as Y from 'yjs'

import { uploadScopedResource } from 'src/store'

import { getAuth } from './utils'

export const handleRESTImport = async ({
  item,
  scopeId,
  rawBearer,
  foundIds,
  itemIndex,
}: {
  item: ImportRequest
  scopeId: string
  rawBearer: string
  foundIds: { oldId: string; newId: string }[]
  itemIndex: number
}) => {
  const request = new Y.Map()
  const requestId = foundIds.find((i) => i.oldId === item._id)?.newId
  if (!requestId)
    throw new Error(`requestId not found', ${JSON.stringify(item)}`)

  request.set('id', requestId)
  request.set('name', item.name)
  request.set('createdAt', new Date().toISOString())
  request.set('updatedAt', null)
  request.set('description', item.description)
  request.set('__typename', 'RESTRequest')
  request.set(
    'parentId',
    foundIds.find((i) => i.oldId === item.parentId)?.newId
  )
  request.set(
    '__parentTypename',
    item.parentId === '__GRP_1__' ? 'Collection' : 'Folder'
  )
  // Skip ordering index for now
  request.set('orderingIndex', 0)

  request.set('method', item.method)
  request.set('endpoint', item.url?.split('?')[0])

  request.set(
    'params',
    Object.entries(parse(item.url?.split('?')[1] || '')).map(
      ([key, value], index) => ({
        id: index,
        keyString: key,
        value: value?.toString(),
        enabled: true,
      })
    )
  )

  request.set(
    'headers',
    (item.headers || []).map((header, index) => ({
      id: index,
      keyString: header.name,
      value: header.value,
      enabled: true,
    }))
  )

  request.set(
    'body',
    await getBody({ item, scopeId, rawBearer, itemIndex, requestId })
  )

  request.set('auth', await getAuth({ item }))

  request.set('description', item.description)

  return { requestId, request }
}

const getBody = async ({
  item,
  scopeId,
  rawBearer,
  itemIndex,
  requestId,
}: {
  item: ImportRequest
  scopeId: string
  rawBearer: string
  itemIndex: number
  requestId: string
}) => {
  if (typeof item.body === 'string') {
    return {
      contentType: 'text/plain',
      body: item.body,
    }
  } else if (item.parameters) {
    return {
      contentType: 'application/x-www-form-urlencoded',
      body: item.parameters.map((param, index) => ({
        id: index,
        keyString: param.name,
        value: param.value,
        enabled: !param.disabled,
      })),
    }
  } else if (item.body?.mimeType === 'multipart/form-data') {
    // Create FormDataKeyValue and put in store
    const formData = await Promise.all(
      (item.body?.params ?? []).map(async (param, index) => {
        // If no file, just return an empty text field regardless of type
        if (!param.value)
          return {
            id: index,
            keyString: param.name,
            value: '',
            enabled: !param.disabled ?? true,
            isFile: false,
          }

        if (param.type === 'file') {
          const storeReceipt = await uploadScopedResource({
            scopeId,
            rawBearer,
            resource: new Blob([param.value]),
            resourceName: `request-${requestId}-file-${itemIndex}`,
          })

          return {
            id: index,
            keyString: param.name,
            value: {
              __typename: 'StoredObject',
              storeReceipt,
              data: null,
            },
            enabled: true,
          }
        }
        return {
          id: index,
          keyString: param.name,
          value: param.value,
          enabled: !param.disabled ?? true,
          isFile: false,
        }
      })
    )

    return {
      contentType: 'multipart/form-data',
      body: formData,
    }
  } else if (item.body?.text?.length === 0 || item.body?.text === undefined) {
    return {
      contentType: null,
      body: null,
    }
  } else {
    try {
      // See if body can be parsed as JSON
      JSON.parse(item.body?.text)
      return {
        contentType: 'application/json',
        body: item.body?.text,
      }
    } catch (e) {
      return {
        contentType: 'text/plain',
        body: item.body?.text,
      }
    }
  }
}
