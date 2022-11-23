import { StoredObject } from '@apiteam/types'
import axios from 'axios'
import * as Y from 'yjs'

import { checkValue } from '../../config'

import { OpenDoc } from './open-doc'

type StoredTarget = Y.Map<unknown> | StoredObject<never>

const internalAPIKey = checkValue<string>('api.internalAPIKey')
const storeURL = `${checkValue<string>('store.host')}:${checkValue<number>(
  'store.port'
)}`

/* Searches for store receipts in a Y.Doc and asks Store to delete any not found
in the doc */
export const cleanupStoreReceipts = async (openDoc: OpenDoc) => {
  const receipts = findStoreReceipts(openDoc)

  // Tell Store to delete any receipts not found in the doc
  await axios(`http://${storeURL}/internal/store/cleanup-stored-objects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `APIKey ${internalAPIKey}`,
    },
    data: receipts,
    params: {
      variant: openDoc.variant,
      variantTargetId: openDoc.variantTargetId,
    },
  }).catch((error) => console.error(error))
}

/* Recusively searches an open doc for store receipts */
export const findStoreReceipts = (openDoc: OpenDoc): string[] => {
  const receipts: string[] = []

  const projectsYMap = openDoc.getMap('projects') as Y.Map<never>

  for (const value of projectsYMap) {
    receipts.push(...findStoreReceiptsInYMap(value))
  }

  return receipts
}

const findStoreReceiptsInYMap = (yMap: Y.Map<StoredTarget>): string[] => {
  const receipts: string[] = []

  Array.from(yMap.values()).forEach((value) => {
    if (value instanceof Y.Map) {
      receipts.push(...findStoreReceiptsInYMap(value))
    } else if (
      typeof value === 'object' &&
      value?.__typename === 'StoredObject' &&
      typeof value?.storeReceipt === 'string'
    ) {
      receipts.push(value.storeReceipt)
    }
  })

  return receipts
}
