import {
  DEFAULT_CREDITS_PRICING_OPTION,
  DEFAULT_PRICING_PLANS,
} from '@apiteam/types'
import { db } from 'api/src/lib/db'
import { PlanInfoModel, CreditsPricingOptionModel } from 'api/src/models'
import yargs from 'yargs/yargs'

export default async () => {
  const argv = yargs(process.argv.slice(2)).options({
    deleteExisting: { type: 'boolean', default: false },
  }).argv

  if (argv['deleteExisting']) {
    console.log('Deleting existing pricing plans...')

    console.log(
      'Make sure to manually delete the Stripe Prices then Plans too, these cannot be deleted automatically'
    )

    await PlanInfoModel.getAll().then((plans) =>
      Promise.all(plans.map((plan) => PlanInfoModel.delete(plan.id)))
    )

    await CreditsPricingOptionModel.getAll().then((options) =>
      Promise.all(
        options.map((option) => CreditsPricingOptionModel.delete(option.id))
      )
    )
  } else if (argv['updateExisting']) {
    console.log('Updating existing pricing plans...')
    await PlanInfoModel.getAll().then((plans) =>
      Promise.all(
        plans.map((plan) => {
          const newPlan = DEFAULT_PRICING_PLANS.find(
            (p) => p.name === plan.name
          )
          if (newPlan) {
            return PlanInfoModel.update(plan.id, newPlan)
          }
        })
      )
    )

    await CreditsPricingOptionModel.getAll().then((options) =>
      Promise.all(
        options.map((option) => {
          const newOption =
            DEFAULT_CREDITS_PRICING_OPTION.name === option.name
              ? DEFAULT_CREDITS_PRICING_OPTION
              : null

          if (newOption) {
            return CreditsPricingOptionModel.update(option.id, newOption)
          }
        })
      )
    )
  } else if (argv['ensureOriginalOnly']) {
    // Ensure only first object instance with a given name exists
    // Sort so oldest object appears first
    const existingPlans = await PlanInfoModel.getAll().then((plans) =>
      plans.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    )

    const existingPlanNames = new Set<string>()

    for (const plan of existingPlans) {
      if (existingPlanNames.has(plan.name)) {
        await PlanInfoModel.delete(plan.id)
      } else {
        existingPlanNames.add(plan.name)
      }
    }

    const existingOptions = await CreditsPricingOptionModel.getAll().then(
      (options) =>
        options.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    )

    const existingOptionNames = new Set<string>()

    for (const option of existingOptions) {
      if (existingOptionNames.has(option.name)) {
        await CreditsPricingOptionModel.delete(option.id)
      } else {
        existingOptionNames.add(option.name)
      }
    }

    console.log('Finished ensuring original only')
  } else {
    // Check if plans already exist
    const existingPlanCount = await db.planInfo.count()
    if (existingPlanCount === 0) {
      await Promise.all(
        DEFAULT_PRICING_PLANS.map((plan) => PlanInfoModel.create(plan))
      )
    } else {
      console.log('Pricing plans already exist, skipping')
    }

    // Check if credits pricing option already exists
    const existingCreditsPricingOptionCount =
      await db.creditsPricingOption.count()
    if (existingCreditsPricingOptionCount === 0) {
      CreditsPricingOptionModel.create(DEFAULT_CREDITS_PRICING_OPTION)
    } else {
      console.log('Credits pricing option already exists, skipping')
    }
  }

  console.log('Finished creating pricing plans')
}
