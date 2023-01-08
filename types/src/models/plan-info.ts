import type { Prisma } from '@prisma/client'

import { AVAILABLE_LOAD_ZONES } from '../graph'

export type AbstractPlanInfoCreateInput = Omit<
  Prisma.PlanInfoCreateInput,
  'productId' | 'monthlyPriceId' | 'yearlyPriceId' | 'loadZones'
> & {
  loadZones: string[]
}

export type AbstractPlanInfoUpdateInput = Omit<
  Prisma.PlanInfoUpdateInput,
  | 'productId'
  | 'monthlyPriceId'
  | 'yearlyPriceId'
  | 'verboseName'
  | 'priceMonthlyCents'
  | 'priceYearlyCents'
> & {
  verboseName?: string
  priceMonthlyCents?: number
  priceYearlyCents?: number
}

// TODO: Determine accurate pricing
export const DEFAULT_PRICING_PLANS: AbstractPlanInfoCreateInput[] = [
  {
    name: 'Free',
    verboseName: 'APITeam Free',
    description:
      'Ideal for personal projects and small teams just getting started',
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
    maxMembers: 10,
    maxConcurrentCloudTests: 5,
    maxConcurrentScheduledTests: 0,
    monthlyCredits: 10000,
    loadZones: ['europe-west2', 'us-west2'],
    maxTestDurationMinutes: 10,
    maxSimulatedUsers: 500,
    dataRetentionMonths: 1,
  },
  {
    name: 'Pro',
    verboseName: 'APITeam Pro',
    description:
      'For teams that want to scale their projects with unlimited members and greater load testing capabilities',
    priceMonthlyCents: 2900,
    priceYearlyCents: 29000,
    freeTrialDays: 14,
    maxMembers: -1,
    loadZones: [...AVAILABLE_LOAD_ZONES],
    maxConcurrentCloudTests: 10,
    maxConcurrentScheduledTests: 5,
    monthlyCredits: 50000,
    maxTestDurationMinutes: 50,

    maxSimulatedUsers: 10000,
    dataRetentionMonths: 6,
  },
]
