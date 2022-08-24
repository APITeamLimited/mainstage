import { context } from '@redwoodjs/graphql-server'

import { db } from 'src/lib/db'

export const checkAdmin = async () => {
  // Ensure user is member of the team{
  if (!context.currentUser) {
    throw 'You must be logged in to access this resource.'
  }

  const userId = context.currentUser?.id

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  })

  if (!user) {
    throw 'You must be logged in to access this resource.'
  }

  if (!user?.isAdmin) {
    throw 'You must be an admin to access this resource.'
  }
}
