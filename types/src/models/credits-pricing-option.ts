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
  credits: 50000 * 1000,
  priceCents: 500,
  name: '50K Credits',
  verboseName: '50K Credits (pay as you go)',
} as const as AbstractCreditsPricingOptionCreateInput
