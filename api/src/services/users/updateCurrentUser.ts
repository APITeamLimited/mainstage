import { UserAsPersonal } from '@apiteam/types-commonjs'

import { ServiceValidationError } from '@redwoodjs/api'

import { db } from '../../lib/db'
import { UserModel } from '../../models/user'
import { checkSlugAvailable } from '../../validators'

export const updateCurrentUser = async ({
  firstName,
  lastName,
  shortBio,
  emailMarketing,
  slug,
}: {
  firstName?: string
  lastName?: string
  shortBio?: string | null
  emailMarketing?: boolean
  slug?: string
}): Promise<UserAsPersonal> => {
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

  // Validate first UserAsPersonal last name max length of 50 characters each
  if (firstName && firstName.length > 50) {
    throw new ServiceValidationError(
      'Your first name must be less than 50 characters.'
    )
  }

  // Check name one word with only letters and numbers
  if (slug) {
    if (slug.length < 5) {
      throw new ServiceValidationError(
        'Slug must be at least 5 characters long'
      )
    }

    // Ensure name is only alphanumeric no spaces
    if (slug.match(/[^a-z0-9]+/g)) {
      throw new ServiceValidationError(
        'Slug must be one word with only lowercase letters and numbers'
      )
    }

    if (slug === context.currentUser.slug) {
      throw new ServiceValidationError('Slug must be new')
    }

    await checkSlugAvailable(slug)
  }

  return UserModel.update(context.currentUser.id, {
    firstName,
    lastName,
    shortBio,
    emailMarketing,
    slug,
  })
}
