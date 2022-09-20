import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

import { handleFolderImport } from './folder'
import { handleRESTImport } from './rest-request'
import { importToInsomnia } from './utils'

export type ImportResult = {
  collection: {
    collectionId: string
    collection: Y.Map<any>
  }
  environment: {
    environmentId: string
    environment: Y.Map<any>
    variablesCount: number
  } | null
  restRequestsCount: number
  foldersCount: number
  importerName: string
} | null

export const importRaw = async ({
  rawText,
  scopeId,
  rawBearer,
}: {
  rawText: string
  scopeId: string
  rawBearer: string
}): Promise<ImportResult> => {
  const importResult = await importToInsomnia(rawText)

  if (!importResult) return null
  const { output, importerName } = importResult

  const foundIds: {
    oldId: string
    newId: string
  }[] = []

  output.forEach(({ parentId, _id }) => {
    // Check if parentId or _id have been found already
    if (_id && !foundIds.find((item) => item.oldId === _id)) {
      foundIds.push({
        oldId: _id,
        newId: uuid(),
      })
    }
    if (parentId && !foundIds.find((item) => item.oldId === parentId)) {
      foundIds.push({
        oldId: parentId,
        newId: uuid(),
      })
    }
  })

  // Create Collection from __GRP_1__
  const grp1 = output.find((item) => item._id === '__GRP_1__')
  if (!grp1) return null

  const collection = new Y.Map()
  const collectionId = foundIds.find((i) => i.oldId === grp1._id)?.newId
  if (!collectionId) throw new Error('collectionId not found')

  collection.set('id', collectionId)
  collection.set('name', grp1.name)
  collection.set('createdAt', new Date().toISOString())
  collection.set('updatedAt', null)
  collection.set('folders', new Y.Map())
  collection.set('restRequests', new Y.Map())
  collection.set('restResponses', new Y.Map())
  collection.set('description', grp1.description)
  collection.set('__typename', 'Collection')

  let environment = null as Y.Map<any> | null
  let environmentId = null as string | null
  let variablesCount = 0
  if (grp1.variable) {
    environment = new Y.Map()
    environmentId = uuid()
    environment.set('id', environmentId)
    environment.set('name', grp1.name)
    environment.set('createdAt', new Date().toISOString())
    environment.set('updatedAt', null)
    environment.set('__typename', 'Environment')
    environment.set(
      'variables',
      Object.entries(
        grp1.variable as {
          [key: string]: string
        }
      ).map(([key, value], index) => ({
        id: index,
        keyString: key,
        value: value,
        enabled: true,
      }))
    )

    variablesCount = Object.keys(grp1.variable).length
  }

  // Remove grp1 from output
  output.splice(output.indexOf(grp1), 1)

  const restRequests = new Y.Map()
  const folders = new Y.Map()

  let restRequestsCount = 0
  let foldersCount = 0

  const foundItems = (
    await Promise.all(
      output.map(async (item, itemIndex) => {
        if (!item.parentId || !item._id) return

        if (item._type === 'request') {
          const { requestId, request } = await handleRESTImport({
            item,
            scopeId,
            rawBearer,
            foundIds,
            itemIndex,
          })

          restRequestsCount += 1

          return {
            __typename: 'RestRequest',
            id: requestId,
            item: request,
          }
        } else if (item._type === 'request_group') {
          const { folderId, folder } = await handleFolderImport({
            item,
            foundIds,
          })

          foldersCount += 1

          return {
            __typename: 'Folder',
            id: folderId,
            item: folder,
          }
        }
      })
    )
  ).filter((item) => item) as {
    __typename: 'Folder' | 'RestRequest'
    id: string
    item: Y.Map<any>
  }[]

  foundItems.forEach(({ __typename, id, item }) => {
    if (__typename === 'Folder') {
      folders.set(id, item)
    } else if (__typename === 'RestRequest') {
      restRequests.set(id, item)
    }
  })

  collection.set('restRequests', restRequests)
  collection.set('folders', folders)

  return {
    collection: { collectionId, collection },
    environment:
      environmentId && environment
        ? {
            environmentId,
            environment,
            variablesCount,
          }
        : null,
    restRequestsCount,
    foldersCount,
    importerName,
  }
}

export { getImporterNames } from './utils'
