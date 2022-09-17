import { v4 as uuid } from 'uuid'
import * as Y from 'yjs'

export const importPostmanCollection = (collectionRaw: string) => {
  try {
    const collectionObj = JSON.parse(collectionRaw)
    if (!collectionObj?.info?.schema) return null

    const collection = new Y.Map()
    collection.set('id', uuid())
    collection.set('name', collectionObj.info.name)
    collection.set('description', collectionObj.info.description)

    console.log(collection)

    return {
      importType: 'PostmanCollection',
      data: collection.toJSON(),
    }
  } catch (e) {
    return null
  }
}
