import { Models } from 'api/src/models'

export default async () => {
  console.log('Rebuilding core cache')

  Models.forEach(async (model) => {
    await model.rebuildCache?.()
  })

  console.log('Core cache rebuilt')
}
