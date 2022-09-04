import * as Yup from 'yup'

import { ServiceValidationError } from '@redwoodjs/api'

import { setUserRedis } from 'src/helpers'
import { db } from 'src/lib/db'

export const updateCurrentUser = async ({
  firstName,
  lastName,
  shortBio,
  emailMarketing,
}: {
  firstName?: string
  lastName?: string
  shortBio?: string | null
  emailMarketing?: boolean
}) => {
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to update your profile.'
    )
  }

  // Validate shortBio max length of 140 characters
  if (shortBio && shortBio.length > 140) {
    throw new ServiceValidationError(
      'Your short bio must be less than 140 characters.'
    )
  }

  // Validate first and last name max length of 50 characters each
  if (firstName && firstName.length > 50) {
    throw new ServiceValidationError(
      'Your first name must be less than 50 characters.'
    )
  }

  const updatedUser = await db.user.update({
    where: {
      id: context.currentUser.id,
    },
    data: {
      firstName,
      lastName,
      shortBio,
      emailMarketing,
    },
  })

  await setUserRedis(updatedUser)

  return updatedUser
}
