import {
  APITeamModel,
  GetAllMixin,
  AbstractPlanInfoCreateInput,
  AbstractPlanInfoUpdateInput,
} from '@apiteam/types'
import type { Prisma, PlanInfo } from '@prisma/client'

import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { stripe } from 'src/lib/stripe'
import { setModelRedis } from 'src/utils'

export const PlanInfoModel: APITeamModel<
  AbstractPlanInfoCreateInput,
  AbstractPlanInfoUpdateInput,
  PlanInfo
> &
  GetAllMixin<PlanInfo> = {
  create: async (input) => {
    const newPlanInfo = await db.planInfo.create({
      data: await createProductAndPrices(input),
    })

    await setModelRedis('planInfo', coreCacheReadRedis, newPlanInfo)

    return newPlanInfo
  },
  update: async (id, input) => {
    const originalPlanInfo = await db.planInfo.findUnique({
      where: { id },
    })

    if (!originalPlanInfo) {
      throw new Error(`PlanInfo with id ${id} not found`)
    }

    const updatedPlanInfo = await db.planInfo.update({
      data: await updateProductAndPrices(originalPlanInfo, input),
      where: { id },
    })

    await setModelRedis('planInfo', coreCacheReadRedis, updatedPlanInfo)

    return updatedPlanInfo
  },
  delete: async (id) => {
    const deletedPlanInfo = await db.planInfo.delete({
      where: { id },
    })

    await coreCacheReadRedis.hDel('planInfo', id)

    return deletedPlanInfo
  },
  exists: async (id) => {
    const rawPlanInfo = await coreCacheReadRedis.hGet('planInfo', id)
    return !!rawPlanInfo
  },
  get: async (id) => {
    const rawPlanInfo = await coreCacheReadRedis.hGet('planInfo', id)
    return rawPlanInfo ? JSON.parse(rawPlanInfo) : null
  },
  getMany: async (ids) => {
    return Promise.all(ids.map(PlanInfoModel.get))
  },
  getAll: async () => {
    const rawPlanInfos = await coreCacheReadRedis.hVals('planInfo')
    return rawPlanInfos.map((rawPlanInfo) => JSON.parse(rawPlanInfo))
  },
  rebuildCache: async () => {
    await coreCacheReadRedis.del('planInfo')

    let skip = 0
    let batchSize = 0

    do {
      const planInfos = await db.planInfo.findMany({
        skip,
        take: 100,
      })

      setModelRedis('planInfo', coreCacheReadRedis, planInfos)

      skip += planInfos.length
      batchSize = planInfos.length
    } while (batchSize > 0)
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
  originalPlanInfo: PlanInfo,
  updateInput: AbstractPlanInfoUpdateInput
): Promise<Prisma.PlanInfoUpdateInput> => {
  if (
    updateInput.verboseName &&
    updateInput.verboseName !== originalPlanInfo.verboseName
  ) {
    await stripe.products.update(originalPlanInfo.productId, {
      name: updateInput.verboseName,
    })
  }

  let monthlyPriceId = originalPlanInfo.monthlyPriceId
  let yearlyPriceId = originalPlanInfo.yearlyPriceId

  if (
    updateInput.priceMonthlyCents &&
    updateInput.priceMonthlyCents !== originalPlanInfo.priceMonthlyCents
  ) {
    // Set the old price to inactive
    await stripe.prices.update(originalPlanInfo.monthlyPriceId, {
      active: false,
    })

    monthlyPriceId = (
      await stripe.prices.create({
        product: originalPlanInfo.productId,
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
    updateInput.priceYearlyCents !== originalPlanInfo.priceYearlyCents
  ) {
    await stripe.prices.update(originalPlanInfo.yearlyPriceId, {
      active: false,
    })

    yearlyPriceId = (
      await stripe.prices.create({
        product: originalPlanInfo.productId,
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
