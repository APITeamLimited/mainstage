import { randomBytes } from 'crypto'

import { VerifiedDomain } from '@prisma/client'
import extractDomain from 'extract-domain'

import { ServiceValidationError } from '@redwoodjs/api'

import { setVerifiedDomainRedis } from 'src/helpers/verified-domains'
import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { checkOwnerAdmin } from 'src/services/guards'

const verifiedDomainRegex = new RegExp(
  '^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$'
)

const isValidDomain = (domain: string) => {
  if (domain === '') return false
  if (!verifiedDomainRegex.test(domain)) return false
  return extractDomain(domain) === domain
}

export const addVerifiedDomain = async ({
  domain,
  teamId,
}: {
  domain: string
  teamId: string | null
}) => {
  // If teamId check is admin
  if (teamId) await checkOwnerAdmin({ teamId })
  if (!context.currentUser) {
    throw new ServiceValidationError(
      'You must be logged in to access this resource.'
    )
  }
  const variantTargetId = teamId ?? context.currentUser?.id
  const variant = teamId ? 'TEAM' : 'USER'

  // Ensure verifiedDomain is valid and not a subverifiedDomain
  if (!isValidDomain(domain)) {
    throw new ServiceValidationError('Invalid domain.')
  }

  // Check verifiedDomain is not already verified
  const verifiedDomainIds = await coreCacheReadRedis.sMembers(
    `verifiedDomain__domain:${domain}`
  )
  const verifiedDomains = (
    verifiedDomainIds.length > 0
      ? await coreCacheReadRedis.mGet(
          verifiedDomainIds.map((id) => `verifiedDomain__id:${id}`)
        )
      : []
  )
    .filter((d) => d !== null)
    .map((d) => JSON.parse(d || '')) as VerifiedDomain[]

  const existingInTeam = verifiedDomains.find(
    (d) => d.variantTargetId === variantTargetId && d.variant === variant
  )

  if (existingInTeam) {
    throw new ServiceValidationError(
      `Domain already added to this ${variant.toLowerCase()}.`
    )
  }

  // Create verifiedDomain
  const newDomain = await db.verifiedDomain.create({
    data: {
      domain,
      variant,
      variantTargetId,
      // Make txt reocrd a random 100 character string
      txtRecord: `apiteam_${randomBytes(50).toString('hex')}`,
    },
  })

  await setVerifiedDomainRedis(newDomain)

  return newDomain
}
