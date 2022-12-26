export type TeamAsTeam = {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date | null
  shortBio: string | null
  profilePicture: string | null
  customerId: string | null
  planInfoId: string | null
}

export type TeamAsPublic = {
  id: string
  name: string
  slug: string
  profilePicture: string | null
}
