import { ServiceValidationError } from '@redwoodjs/api'
import { context } from '@redwoodjs/graphql-server'

export const checkAdmin = async () => {
  // Ensure user is member of the team{
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  if (!context.currentUser.isAdmin) {
    throw new ServiceValidationError(
      'You must be an admin to access this resource.'
    )
  }
}
