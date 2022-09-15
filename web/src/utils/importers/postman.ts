import { Collection } from 'postman-collection'

export const importPostmanCollection = async (collectionRaw: string) => {
  const collection = new Collection(JSON.parse(collectionRaw))
}
