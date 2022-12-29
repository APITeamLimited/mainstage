import type { CreditsPricingOption, PlanInfo } from '@prisma/client'

import { PlanInfoModel } from 'src/models'
import { CreditsPricingOptionModel } from 'src/models'

export const planInfos = async (): Promise<PlanInfo[]> => {
  const plans = await PlanInfoModel.getAll()

  // Only show active plans
  return plans.filter((plan) => plan.isActive)
}

export const creditsPricingOptions = async (): Promise<
  CreditsPricingOption[]
> => {
  const creditsPricingOptions = await CreditsPricingOptionModel.getAll()

  // Only show active options
  return creditsPricingOptions.filter((option) => option.isActive)
}
