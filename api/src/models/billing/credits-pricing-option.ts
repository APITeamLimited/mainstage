import {
  APITeamModel,
  GetAllMixin,
  AbstractCreditsPricingOptionCreateInput,
  AbstractCreditsPricingOptionUpdateInput,
} from '@apiteam/types'
import type { Prisma, CreditsPricingOption } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { stripe } from 'src/lib/stripe'
import { setModelRedis } from 'src/utils'

export const CreditsPricingOptionModel: APITeamModel<
  AbstractCreditsPricingOptionCreateInput,
  AbstractCreditsPricingOptionUpdateInput,
  CreditsPricingOption
> &
  GetAllMixin<CreditsPricingOption> = {
  create: async (input) => {
    const newCreditsPricingOption = await db.creditsPricingOption.create({
      data: await createProductAndPrices(input),
    })

    await setModelRedis(
      'creditsPricingOption',
      coreCacheReadRedis,
      newCreditsPricingOption
    )

    return newCreditsPricingOption
  },
  update: async (id, input) => {
    const originalCreditsPricingOption =
      await db.creditsPricingOption.findUnique({
        where: { id },
      })

    if (!originalCreditsPricingOption) {
      throw new Error(`CreditsPricingOption with id ${id} not found`)
    }

    const updatedCreditsPricingOption = await db.creditsPricingOption.update({
      data: await updateProductAndPrices(originalCreditsPricingOption, input),
      where: { id },
    })

    await setModelRedis(
      'creditsPricingOption',
      coreCacheReadRedis,
      updatedCreditsPricingOption
    )

    return updatedCreditsPricingOption
  },
  delete: async (id) => {
    const deletedCreditsPricingOption = await db.creditsPricingOption.delete({
      where: { id },
    })

    await coreCacheReadRedis.hDel('creditsPricingOption', id)

    return deletedCreditsPricingOption
  },
  exists: async (id) => {
    const rawCreditsPricingOption = await coreCacheReadRedis.hGet(
      'creditsPricingOption',
      id
    )
    return !!rawCreditsPricingOption
  },
  get: async (id) => {
    const rawCreditsPricingOption = await coreCacheReadRedis.hGet(
      'creditsPricingOption',
      id
    )
    return rawCreditsPricingOption ? JSON.parse(rawCreditsPricingOption) : null
  },
  getMany: async (ids) => {
    return Promise.all(ids.map(CreditsPricingOptionModel.get))
  },
  getAll: async () => {
    const rawcreditsPricingOptions = await coreCacheReadRedis.hVals(
      'creditsPricingOption'
    )
    return rawcreditsPricingOptions.map((rawCreditsPricingOption) =>
      JSON.parse(rawCreditsPricingOption)
    )
  },
  rebuildCache: async () => {
    await coreCacheReadRedis.del('creditsPricingOption')

    let skip = 0
    let batchSize = 0

    do {
      const creditsPricingOptions = await db.creditsPricingOption.findMany({
        skip,
        take: 100,
      })

      skip += creditsPricingOptions.length
      batchSize = creditsPricingOptions.length

      await setModelRedis(
        'creditsPricingOption',
        coreCacheReadRedis,
        creditsPricingOptions
      )
    } while (batchSize > 0)
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
  originalCreditsPricingOption: CreditsPricingOption,
  updateInput: AbstractCreditsPricingOptionUpdateInput
): Promise<Prisma.CreditsPricingOptionUpdateInput> => {
  if (
    updateInput.verboseName &&
    updateInput.verboseName !== originalCreditsPricingOption.verboseName
  ) {
    await stripe.products.update(originalCreditsPricingOption.productId, {
      name: updateInput.verboseName,
    })
  }

  let priceId = originalCreditsPricingOption.priceId

  if (
    updateInput.priceCents &&
    updateInput.priceCents !== originalCreditsPricingOption.priceCents
  ) {
    // Set the old price to inactive
    await stripe.prices.update(originalCreditsPricingOption.priceId, {
      active: false,
    })

    // Create a new price
    priceId = (
      await stripe.prices.create({
        unit_amount: updateInput.priceCents,
        currency: 'usd',
        product: originalCreditsPricingOption.productId,
        tax_behavior: 'exclusive',
      })
    ).id
  }

  return {
    ...updateInput,
    priceId,
  }
}
