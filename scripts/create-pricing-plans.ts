import { AVAILABLE_LOAD_ZONES } from '@apiteam/types'
import { db } from 'api/src/lib/db'
import {
  AbstractPlanInfoCreateInput,
  PlanInfoModel,
  CreditsPricingOptionModel,
  AbstractCreditsPricingOptionCreateInput,
} from 'api/src/models'
import yargs from 'yargs/yargs'

// TODO: Determine accurate pricing
const pricingPlans: AbstractPlanInfoCreateInput[] = [
  {
    name: 'Free',
    verboseName: 'APITeam Free',
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
    maxMembers: 10,
    maxConcurrentCloudTests: 5,
    monthlyCredits: 10000,
    loadZones: ['europe-west2', 'us-west2'],
    testSchedulingEnabled: false,
    maxTestDurationMinutes: 10,
    maxSimulatedUsers: 500,
    dataRetentionMonths: 1,
  },
  {
    name: 'Pro',
    verboseName: 'APITeam Pro',
    priceMonthlyCents: 2900,
    priceYearlyCents: 29000,
    freeTrialDays: 14,
    maxMembers: -1,
    loadZones: [...AVAILABLE_LOAD_ZONES],
    maxConcurrentCloudTests: 10,
    monthlyCredits: 50000,
    testSchedulingEnabled: true,
    maxTestDurationMinutes: 50,

    maxSimulatedUsers: 10000,
    dataRetentionMonths: 6,
  },
]

const creditsPricingPlan = {
  credits: 50000,
  priceCents: 500,
  name: '50,000 credits',
  verboseName: '50,000 credits (pay as you go)',
} as AbstractCreditsPricingOptionCreateInput

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

    await CreditsPricingOptionModel.getAll().then((plans) =>
      Promise.all(
        plans.map((plan) => CreditsPricingOptionModel.delete(plan.id))
      )
    )
  }

  // Check if plans already exist
  const existingPlanCount = await db.planInfo.count()
  if (existingPlanCount === 0) {
    await Promise.all(pricingPlans.map((plan) => PlanInfoModel.create(plan)))
  } else {
    console.log('Pricing plans already exist, skipping')
  }

  // Check if credits pricing option already exists
  const existingCreditsPricingOptionCount =
    await db.creditsPricingOption.count()
  if (existingCreditsPricingOptionCount === 0) {
    CreditsPricingOptionModel.create(creditsPricingPlan)
  } else {
    console.log('Credits pricing option already exists, skipping')
  }

  console.log('Finished creating pricing plans')
}
