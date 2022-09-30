import { ServiceValidationError } from '@redwoodjs/api'

import { db } from 'src/lib/db'

export const checkSlugAvailable = async (slug: string) => {
  // Check slug not taken by another team or user
  const existingUserPromise = db.user.findFirst({
    where: { slug },
  })

  const existingTeamPromise = db.team.findFirst({
    where: { slug },
  })

  const [existingUser, existingTeam] = await Promise.all([
    existingUserPromise,
    existingTeamPromise,
  ])

  if (existingUser || existingTeam) {
    throw new ServiceValidationError(
      'That slug is already taken. Please try another one.'
    )
  }
}
