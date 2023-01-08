import type { User } from '@prisma/client'

export type UserAsPersonal = {
  id: string
  firstName: string
  lastName: string
  slug: string
  email: string
  createdAt: Date
  updatedAt: Date | null
  isAdmin: boolean
  emailVerified: boolean
  shortBio: string | null
  profilePicture: string | null
  emailMarketing: boolean
  customerId: string | null
  planInfoId: string | null
  subscriptionId: string | null
  hadFreeTrial: boolean
  freeCreditsAddedAt: Date | null
  pastDue: boolean
}

export type UserAsTeam = {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  updatedAt: Date | null
  shortBio: string | null
  profilePicture: string | null
}

export type UserAsPublic = {
  id: string
  firstName: string
  lastName: string
  slug: string
  profilePicture: string | null
}

export const userAsPersonal = (user: User): UserAsPersonal => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  slug: user.slug,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  isAdmin: user.isAdmin,
  emailVerified: user.emailVerified,
  shortBio: user.shortBio,
  profilePicture: user.profilePicture,
  emailMarketing: user.emailMarketing,
  customerId: user.customerId,
  planInfoId: user.planInfoId,
  subscriptionId: user.subscriptionId,
  hadFreeTrial: user.hadFreeTrial,
  freeCreditsAddedAt: user.freeCreditsAddedAt,
  pastDue: user.pastDue,
})

export const userAsTeam = (user: User): UserAsTeam => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  shortBio: user.shortBio,
  profilePicture: user.profilePicture,
})

export const userAsPublic = (user: User): UserAsPublic => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  slug: user.slug,
  profilePicture: user.profilePicture,
})

export const getDisplayName = (user: {
  firstName: string
  lastName: string
}) => {
  const firstName = user.firstName
    .slice(0, 1)
    .toUpperCase()
    .concat(user.firstName.slice(1))

  const lastName = user.lastName
    .slice(0, 1)
    .toUpperCase()
    .concat(user.lastName.slice(1))

  return `${firstName} ${lastName}`
}
