import { Resolver } from 'dns'

import { VerifiedDomain } from '@prisma/client'

import { ServiceValidationError } from '@redwoodjs/api'

import { setVerifiedDomainRedis } from 'src/helpers/verified-domains'
import { db } from 'src/lib/db'
import { coreCacheReadRedis } from 'src/lib/redis'
import { checkOwnerAdmin } from 'src/services/guards'

const resolver = new Resolver()
resolver.setServers(['8.8.8.8', '8.8.4.4'])

export const performVerification = async ({
  verifiedDomainId,
  teamId,
}: {
  verifiedDomainId: string
  teamId: string | null
}) => {
  if (teamId) await checkOwnerAdmin({ teamId })

  const verifiedDomainRaw = await coreCacheReadRedis.get(
    `verifiedDomain__id:${verifiedDomainId}`
  )

  if (!verifiedDomainRaw) {
    throw new ServiceValidationError('Domain not found in your workspace.')
  }

  const verifiedDomain = JSON.parse(verifiedDomainRaw) as VerifiedDomain

  if (verifiedDomain.variant === 'TEAM') {
    if (verifiedDomain.variantTargetId !== teamId) {
      throw new ServiceValidationError('Domain not found in your workspace.')
    }
  } else {
    if (verifiedDomain.variantTargetId !== context.currentUser?.id) {
      throw new ServiceValidationError('Domain not found in your workspace.')
    }
  }

  if (verifiedDomain.verified) {
    throw new ServiceValidationError('Domain is already verified')
  }

  // Lookup DNS txt record, convert to promise
  // If found, update verifiedDomain to verified
  const dnsRecords = await new Promise<string[][]>((resolve, reject) => {
    resolver.resolveTxt(verifiedDomain.domain, (err, records) =>
      err ? reject(err) : resolve(records)
    )
  })

  const found = dnsRecords.some((record) =>
    record.includes(verifiedDomain.txtRecord)
  )

  if (!found) {
    throw new ServiceValidationError('DNS TXT record not found.')
  }

  // Update verifiedDomain to verified
  const updatedVerifiedDomain = await db.verifiedDomain.update({
    where: { id: verifiedDomain.id },
    data: { verified: true },
  })
  await setVerifiedDomainRedis(updatedVerifiedDomain)

  return updatedVerifiedDomain
}
