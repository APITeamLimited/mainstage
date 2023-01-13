import { getFreePlanInfo } from 'api/src/helpers/billing'
import { TeamModel, UserModel } from 'api/src/models'

export default async () => {
  console.log(
    'Ensuring all users and teams have customers in Stripe and a plan in the database'
  )

  const freePlanInfo = await getFreePlanInfo()

  for await (const user of UserModel.getAllAsyncIterator()) {
    await UserModel.getOrCreateCustomerId(user.id).catch((error) => {
      console.log(error)
      return null
    })

    if (!user) {
      continue
    }

    if (!user.planInfoId) {
      await UserModel.update(user.id, {
        planInfoId: freePlanInfo.id,
      })
    }

    // Wait for 200ms to avoid hitting Stripe rate limits
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  for await (const team of TeamModel.getAllAsyncIterator()) {
    await TeamModel.getOrCreateCustomerId(team.id).catch((error) => {
      console.log(error)
      return null
    })

    if (!team) {
      continue
    }

    if (!team.planInfoId) {
      await TeamModel.update(team.id, {
        planInfoId: freePlanInfo.id,
      })
    }

    // Wait for 200ms to avoid hitting Stripe rate limits
    await new Promise((resolve) => setTimeout(resolve, 200))
  }

  console.log(
    "Added customers and plans to all users and teams that didn't have them"
  )
}
