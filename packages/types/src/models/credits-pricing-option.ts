import type { Prisma } from '@prisma/client'

export type AbstractCreditsPricingOptionCreateInput = Omit<
  Prisma.CreditsPricingOptionCreateInput,
  'productId' | 'priceId'
>

export type AbstractCreditsPricingOptionUpdateInput = Omit<
  Prisma.CreditsPricingOptionUpdateInput,
  'productId' | 'priceId' | 'verboseName' | 'priceCents'
> & {
  verboseName?: string
  priceCents?: number
}

export const DEFAULT_CREDITS_PRICING_OPTION = {
  credits: 5 * 1000 * 1000,
  priceCents: 500,
  name: '5K Credits',
  verboseName: '5K Credits (pay as you go)',
} as const as AbstractCreditsPricingOptionCreateInput
