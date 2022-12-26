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
