import { APITeamModel } from '@apiteam/types'
import { Prisma, PlanInfo } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { stripe } from 'src/lib/stripe'
import { setModelRedis } from 'src/utils'

export type AbstractPlanInfoCreateInput = Omit<
  Prisma.PlanInfoCreateInput,
  'productId' | 'monthlyPriceId' | 'yearlyPriceId'
>

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

export const PlanInfoModel: APITeamModel<
  AbstractPlanInfoCreateInput,
  AbstractPlanInfoUpdateInput,
  PlanInfo
> = {
  create: async (input) => {
    const newObject = await db.planInfo.create({
      data: await createProductAndPrices(input),
    })

    await setModelRedis('planInfo', coreCacheReadRedis, newObject)

    return newObject
  },
  update: async (id, input) => {
    const originalObject = await db.planInfo.findUnique({
      where: { id },
    })

    if (!originalObject) {
      throw new Error(`PlanInfo with id ${id} not found`)
    }

    const updatedObject = await db.planInfo.update({
      data: await updateProductAndPrices(originalObject, input),
      where: { id },
    })

    await setModelRedis('planInfo', coreCacheReadRedis, updatedObject)

    return updatedObject
  },
  delete: async (id) => {
    const deletedObject = await db.planInfo.delete({
      where: { id },
    })

    await coreCacheReadRedis.hDel('planInfo', id)

    return deletedObject
  },
  get: async (id) => {
    const rawObject = await coreCacheReadRedis.hGet('planInfo', id)
    return rawObject ? (JSON.parse(rawObject) as PlanInfo) : null
  },
  getAll: async () => {
    const rawObjects = await coreCacheReadRedis.hVals('planInfo')
    return rawObjects.map((rawObject) => JSON.parse(rawObject) as PlanInfo)
  },
  rebuildCache: async () => {
    await coreCacheReadRedis.del('planInfo')

    // Iterate over all planInfo and set them in redis in batches of 100
    const count = await db.planInfo.count()

    for (let i = 0; i < count; i += 100) {
      const planInfo = await db.planInfo.findMany({
        skip: i,
        take: 100,
      })

      setModelRedis('planInfo', coreCacheReadRedis, planInfo)
    }
  },
}

const createProductAndPrices = async (
  createInput: AbstractPlanInfoCreateInput
): Promise<Prisma.PlanInfoCreateInput> => {
  const productId = (
    await stripe.products.create({
      name: createInput.verboseName,
      type: 'service',
    })
  ).id

  const monthlyPriceId = (
    await stripe.prices.create({
      product: productId,
      unit_amount: createInput.priceMonthlyCents,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      tax_behavior: 'exclusive',
    })
  ).id

  const yearlyPriceId = (
    await stripe.prices.create({
      product: productId,
      unit_amount: createInput.priceYearlyCents,
      currency: 'usd',
      recurring: {
        interval: 'year',
      },
      tax_behavior: 'exclusive',
    })
  ).id

  return {
    ...createInput,
    productId,
    monthlyPriceId,
    yearlyPriceId,
  }
}

const updateProductAndPrices = async (
  originalObject: PlanInfo,
  updateInput: AbstractPlanInfoUpdateInput
): Promise<Prisma.PlanInfoUpdateInput> => {
  if (
    updateInput.verboseName &&
    updateInput.verboseName !== originalObject.verboseName
  ) {
    await stripe.products.update(originalObject.productId, {
      name: updateInput.verboseName,
    })
  }

  let monthlyPriceId = originalObject.monthlyPriceId
  let yearlyPriceId = originalObject.yearlyPriceId

  if (
    updateInput.priceMonthlyCents &&
    updateInput.priceMonthlyCents !== originalObject.priceMonthlyCents
  ) {
    // Set the old price to inactive
    await stripe.prices.update(originalObject.monthlyPriceId, {
      active: false,
    })

    monthlyPriceId = (
      await stripe.prices.create({
        product: originalObject.productId,
        currency: 'usd',
        unit_amount: updateInput.priceMonthlyCents,
        recurring: {
          interval: 'month',
        },
        tax_behavior: 'exclusive',
      })
    ).id
  }

  if (
    updateInput.priceYearlyCents !== undefined &&
    updateInput.priceYearlyCents !== originalObject.priceYearlyCents
  ) {
    await stripe.prices.update(originalObject.yearlyPriceId, {
      active: false,
    })

    yearlyPriceId = (
      await stripe.prices.create({
        product: originalObject.productId,
        currency: 'usd',
        unit_amount: updateInput.priceYearlyCents,
        recurring: {
          interval: 'year',
        },
        tax_behavior: 'exclusive',
      })
    ).id
  }

  return {
    ...updateInput,
    monthlyPriceId,
    yearlyPriceId,
  }
}
