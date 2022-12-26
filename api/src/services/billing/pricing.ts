import type { CreditsPricingOption, PlanInfo } from '@prisma/client'

import { PlanInfoModel } from 'src/models'
import { CreditsPricingOptionModel } from 'src/models'

export const pricingPlans = async (): Promise<PlanInfo[]> => {
  const plans = await PlanInfoModel.getAll()

  return plans.filter((plan) => plan.isActive)
}

export const creditsPricingOptions = async (): Promise<
  CreditsPricingOption[]
> => {
  const creditsPricingOptions = await CreditsPricingOptionModel.getAll()

  return creditsPricingOptions.filter((option) => option.isActive)
}
