import * as Y from 'yjs'

import { importPostmanCollection } from './postman'

type ImportResult = {
  importType: 'PostmanCollection'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Y.Map<any>
}

const importers = [importPostmanCollection] as Array<
  (rawString: string) => ImportResult | null
>

export const importRaw = (rawString: string) => {
  let result = null

  for (const importer of importers) {
    const importResult = importer(rawString)

    if (importResult) {
      result = importResult
      break
    }
  }

  return result
}
