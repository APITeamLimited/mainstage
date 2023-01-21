import { UserModel } from 'api/src/models'
import { url as gravatarUrl } from 'gravatar'

export default async () => {
  let userCount = 0
  let updatedCount = 0

  for await (const user of UserModel.getAllAsyncIterator()) {
    userCount++

    // This has previously been a bug, so we need to check for null as well
    if (!user.profilePicture || user.profilePicture === 'null') {
      await UserModel.update(user.id, {
        profilePicture: gravatarUrl(user.email, {
          default: 'mp',
        }),
      })

      updatedCount++
    }
  }

  console.log(`Updated ${updatedCount} of ${userCount} users.`)
}
