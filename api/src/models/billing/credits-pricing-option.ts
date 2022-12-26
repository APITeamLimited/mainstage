import { APITeamModel } from '@apiteam/types'
import { Prisma, CreditsPricingOption } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { stripe } from 'src/lib/stripe'
import { setModelRedis } from 'src/utils'

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

export const CreditsPricingOptionModel: APITeamModel<
  AbstractCreditsPricingOptionCreateInput,
  AbstractCreditsPricingOptionUpdateInput,
  CreditsPricingOption
> = {
  create: async (input) => {
    const newObject = await db.creditsPricingOption.create({
      data: await createProductAndPrices(input),
    })

    await setModelRedis('creditsPricingOption', coreCacheReadRedis, newObject)

    return newObject
  },
  update: async (id, input) => {
    const originalObject = await db.creditsPricingOption.findUnique({
      where: { id },
    })

    if (!originalObject) {
      throw new Error(`CreditsPricingOption with id ${id} not found`)
    }

    const updatedObject = await db.creditsPricingOption.update({
      data: await updateProductAndPrices(originalObject, input),
      where: { id },
    })

    await setModelRedis(
      'creditsPricingOption',
      coreCacheReadRedis,
      updatedObject
    )

    return updatedObject
  },
  delete: async (id) => {
    await coreCacheReadRedis.hDel('creditsPricingOption', id)

    return db.creditsPricingOption.delete({
      where: { id },
    })
  },
  get: async (id) => {
    const rawObject = await coreCacheReadRedis.hGet('creditsPricingOption', id)
    return rawObject ? (JSON.parse(rawObject) as CreditsPricingOption) : null
  },
  getAll: async () => {
    const rawObjects = await coreCacheReadRedis.hVals('creditsPricingOption')
    return rawObjects.map(
      (rawObject) => JSON.parse(rawObject) as CreditsPricingOption
    )
  },
  rebuildCache: async () => {
    await coreCacheReadRedis.del('creditsPricingOption')

    const count = await db.creditsPricingOption.count()

    for (let i = 0; i < count; i += 100) {
      const objects = await db.creditsPricingOption.findMany({
        skip: i,
        take: 100,
      })

      await Promise.all(
        objects.map((object) =>
          setModelRedis('creditsPricingOption', coreCacheReadRedis, object)
        )
      )
    }
  },
}

const createProductAndPrices = async (
  createInput: AbstractCreditsPricingOptionCreateInput
): Promise<Prisma.CreditsPricingOptionCreateInput> => {
  const productId = (
    await stripe.products.create({
      name: createInput.verboseName,
    })
  ).id

  // Make non-recurring price
  const priceId = (
    await stripe.prices.create({
      unit_amount: createInput.priceCents,
      currency: 'usd',
      product: productId,
      tax_behavior: 'exclusive',
    })
  ).id

  return {
    ...createInput,
    productId,
    priceId,
  }
}

const updateProductAndPrices = async (
  originalObject: CreditsPricingOption,
  updateInput: AbstractCreditsPricingOptionUpdateInput
): Promise<Prisma.CreditsPricingOptionUpdateInput> => {
  if (
    updateInput.verboseName &&
    updateInput.verboseName !== originalObject.verboseName
  ) {
    await stripe.products.update(originalObject.productId, {
      name: updateInput.verboseName,
    })
  }

  let priceId = originalObject.priceId

  if (
    updateInput.priceCents &&
    updateInput.priceCents !== originalObject.priceCents
  ) {
    // Set the old price to inactive
    await stripe.prices.update(originalObject.priceId, {
      active: false,
    })

    // Create a new price
    priceId = (
      await stripe.prices.create({
        unit_amount: updateInput.priceCents,
        currency: 'usd',
        product: originalObject.productId,
        tax_behavior: 'exclusive',
      })
    ).id
  }

  return {
    ...updateInput,
    priceId,
  }
}
