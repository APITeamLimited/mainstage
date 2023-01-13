import { UserAsPersonal } from '@apiteam/types'
import type { Team } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { CustomerModel, PlanInfoModel, TeamModel } from 'src/models'
import { QuoteModel } from 'src/models/billing/quotes'

import { checkAuthenticated, checkOwnerAdmin } from '../guards'

import { trialEligibility } from './trial-status'

type WorkspaceContext =
  | {
      user: UserAsPersonal
    }
  | {
      team: Team
    }

export const createPlanQuote = async ({
  planId,
  pricingOption,
  teamId,
  promotionCode,
}: {
  planId: string
  pricingOption: 'yearly' | 'monthly'
  teamId: string
  promotionCode?: string
}) => {
  const workspaceContext = await authenticateAndGetContext(teamId)

  const planInfo = await PlanInfoModel.get(planId)

  if (!planInfo) {
    throw new ServiceValidationError(`Plan with id ${planId} not found`)
  }

  const customer = await getCustomer(workspaceContext)

  // Search for existing quote

  const quotes = await QuoteModel.getManyFiltered('customer', customer.id)

  // See if there is an existing quote for the same plan

  const isEligibleTrial = await trialEligibility({ teamId })

  const existingQuote = quotes.find(
    (quote) => quote.metadata['planId'] === planId && quote.status === 'draft'
  )

  if (existingQuote) {
    return QuoteModel.update(existingQuote.id, {
      lineItems: [
        {
          price:
            pricingOption === 'yearly'
              ? planInfo.yearlyPriceId
              : planInfo.monthlyPriceId,
          quantity: 1,
        },
      ],
      promotionCode,
      trialDays:
        isEligibleTrial && planInfo.freeTrialDays ? planInfo.freeTrialDays : 0,
    })
  }

  return QuoteModel.create({
    customerId: customer.id,
    description: `${planInfo.verboseName} (${pricingOption})`,
    lineItems: [
      {
        price:
          pricingOption === 'yearly'
            ? planInfo.yearlyPriceId
            : planInfo.monthlyPriceId,
        quantity: 1,
      },
    ],
    promotionCode,
    planId,
    trialDays:
      isEligibleTrial && planInfo.freeTrialDays ? planInfo.freeTrialDays : 0,
  })
}

const authenticateAndGetContext = async (teamId?: string) => {
  if (teamId) {
    await checkOwnerAdmin({ teamId })

    const team = await TeamModel.get(teamId)

    if (!team) {
      throw new ServiceValidationError(`Team with id ${teamId} not found`)
    }

    return {
      team,
    }
  }

  return {
    user: await checkAuthenticated(),
  }
}

const getCustomer = async (workspaceContext: WorkspaceContext) => {
  let customerId: string | null = null

  if ('team' in workspaceContext) {
    customerId = workspaceContext.team.customerId
  } else {
    customerId = workspaceContext.user.customerId
  }

  if (!customerId) {
    throw new Error(`Customer id not found for ${workspaceContext}`)
  }

  const customer = await CustomerModel.get(customerId)

  if (!customer) {
    throw new Error(
      `Customer with id ${customerId} not found for ${workspaceContext}`
    )
  }

  if (customer.deleted) {
    throw new Error(`Customer with id ${customerId} is deleted`)
  }

  return customer
}

export const acceptQuote = async ({
  quoteId,
  teamId,
}: {
  quoteId: string
  teamId?: string
}) => {
  const workspaceContext = await authenticateAndGetContext(teamId)

  const quote = await QuoteModel.get(quoteId).then((quote) => {
    if (!quote) {
      throw new ServiceValidationError(`Quote with id ${quoteId} not found`)
    }

    return quote
  })

  const customer = await getCustomer(workspaceContext)

  if (quote.customer !== customer.id) {
    throw new ServiceValidationError(`Quote with id ${quoteId} not found`)
  }

  if (quote.status !== 'draft') {
    throw new ServiceValidationError(
      `Quote with id ${quoteId} cannot be accepted`
    )
  }

  await QuoteModel.finalize(quoteId)

  return QuoteModel.accept(quoteId)
}
