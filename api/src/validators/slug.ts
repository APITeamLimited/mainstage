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

export const getSlug = async (
  unformattedName: string,
  i = 0
): Promise<string> => {
  // Remove any non alphanumeric characters
  const name = unformattedName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

  const toCheck = `${name}${i > 0 ? i : ''}`

  // Check slug is unique
  try {
    await checkSlugAvailable(toCheck)
  } catch (e) {
    return await getSlug(name, i + 1)
  }

  return toCheck
}
