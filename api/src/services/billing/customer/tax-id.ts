import { taxIdTypeSchema, taxIdValueSchema } from '@apiteam/types-commonjs'

import { ServiceValidationError } from '@redwoodjs/api'

import { CustomerModel } from '../../../models'
import { authenticateAndGetContext, getCustomer } from '../helpers'

export const addTaxId = async ({
  teamId,
  type,
  value,
}: {
  teamId?: string
  type: string
  value: string
}) => {
  const workspaceContext = await authenticateAndGetContext(teamId)
  const customer = await getCustomer(workspaceContext)

  const taxIdValidation = taxIdTypeSchema.safeParse(type)

  if (!taxIdValidation.success) {
    throw new ServiceValidationError(
      `Invalid tax ID type: ${taxIdValidation.error.message}`
    )
  }

  const taxIdValueValidation = taxIdValueSchema.safeParse(value)

  if (!taxIdValueValidation.success) {
    throw new ServiceValidationError(
      `Invalid tax ID value: ${taxIdValueValidation.error.message}`
    )
  }

  return CustomerModel.addTaxId(customer.id, {
    type: taxIdValidation.data,
    value: taxIdValueValidation.data,
  }).catch((error) => {
    throw new ServiceValidationError(error.message)
  })
}

export const removeTaxId = async ({ teamId }: { teamId?: string }) => {
  const workspaceContext = await authenticateAndGetContext(teamId)
  const customer = await getCustomer(workspaceContext)

  return CustomerModel.removeTaxId(customer.id)
}

export const taxId = async ({ teamId }: { teamId?: string }) => {
  const workspaceContext = await authenticateAndGetContext(teamId)
  const customer = await getCustomer(workspaceContext)

  return CustomerModel.getTaxId(customer.id)
}
