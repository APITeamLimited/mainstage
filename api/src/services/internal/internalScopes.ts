import { db } from 'src/lib/db'

export const internalScope = async ({
  id,
  cached = false,
}: {
  id: string
  cached: boolean
}) => {
  if (!cached) {
    return db.scope.findFirst({
      where: {
        id,
      },
    })
  }
  throw 'Cached scope not implemented'
}
