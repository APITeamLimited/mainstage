import { validateWith } from '@redwoodjs/api'

import { db } from '../../lib/db'

import { checkInternal } from '../guards'

export const internalScope = async ({
  id,
  internalAPIKey,
}: {
  id: string
  internalAPIKey: string
}) => {
  validateWith(() => checkInternal(internalAPIKey))

  return db.scope.findFirst({
    where: {
      id,
    },
  })
}
