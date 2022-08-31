import { ServiceValidationError } from '@redwoodjs/api'

import { db } from 'src/lib/db'

export const checkOwnerAdmin = async ({
  teamId,
}: {
  teamId: string | undefined
}) => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }

  if (!teamId) {
    throw new ServiceValidationError('Team id is required.')
  }

  const currentUserMembership = await db.membership.findFirst({
    where: {
      team: { id: teamId },
      user: { id: context.currentUser?.id },
    },
  })

  if (!currentUserMembership) {
    throw new ServiceValidationError(
      'You do not have permission to access this resource.'
    )
  }

  if (
    currentUserMembership.role !== 'OWNER' &&
    currentUserMembership.role !== 'ADMIN'
  ) {
    throw new ServiceValidationError(
      'You need to be an owner or admin to access this resource.'
    )
  }
}
