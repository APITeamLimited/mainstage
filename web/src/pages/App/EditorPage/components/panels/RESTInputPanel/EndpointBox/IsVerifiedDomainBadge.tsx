import { useState, useEffect } from 'react'

import { validateURL } from '@apiteam/types/src'
import { findEnvironmentVariables } from '@apiteam/types/src'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HideSourceIcon from '@mui/icons-material/HideSource'
import { Box, CircularProgress, Tooltip, useTheme } from '@mui/material'
import extractDomain from 'extract-domain'
import isPrivateIp from 'private-ip'

import {
  useCollectionVariables,
  useEnvironmentVariables,
} from 'src/contexts/VariablesProvider'
import { useVerifiedDomains } from 'src/contexts/verified-domains-provider'

type IsVerifiedDomainBadgeProps = {
  endpoint: string
}

export const IsVerifiedDomainBadge = ({
  endpoint,
}: IsVerifiedDomainBadgeProps) => {
  const theme = useTheme()

  const verifiedDomains = useVerifiedDomains()
  const [isVerified, setIsVerified] = useState<
    'yes' | 'no' | 'loading' | 'private' | 'no-url'
  >('no-url')

  const collectionContext = useCollectionVariables()
  const environmentContext = useEnvironmentVariables()

  useEffect(() => {
    const handleFunc = async () => {
      const environmentAwareEndpoint = findEnvironmentVariables(
        environmentContext,
        collectionContext,
        endpoint
      )

      // Check if starts with http:// or https://
      const validatedUrl = await validateURL(environmentAwareEndpoint)

      if (!validatedUrl) {
        setIsVerified('no-url')
        return
      }

      try {
        const url = new URL(validatedUrl)
        const extractedDomain = extractDomain(url.hostname)

        const verifiedSubdomain = verifiedDomains.find(
          (verifiedDomain) => verifiedDomain.domain === extractedDomain
        )

        if (verifiedSubdomain) {
          setIsVerified('yes')
          return
        }

        // Check if the domain is in a private IP range
        if (isPrivateIp(url.hostname) === true) {
          setIsVerified('private')
          return
        }

        setIsVerified('no')
      } catch (error) {
        setIsVerified('no-url')
      }
    }

    handleFunc()
  }, [collectionContext, endpoint, environmentContext, verifiedDomains])

  return (
    <Box
      sx={{
        height: '1rem',
        width: '1rem',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isVerified === 'yes' ? (
        <Tooltip title="Verified domain - load testing limits will be increased">
          <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
        </Tooltip>
      ) : isVerified === 'no' ? (
        <Tooltip title="Unverified domain - load testing limits will be applied">
          <CancelIcon sx={{ color: theme.palette.error.main }} />
        </Tooltip>
      ) : isVerified === 'loading' ? (
        <CircularProgress size={16} />
      ) : isVerified === 'private' ? (
        <Tooltip title="Private IP or localhost - no load testing limits will be applied">
          <HideSourceIcon sx={{ color: theme.palette.secondary.main }} />
        </Tooltip>
      ) : (
        <></>
      )}
    </Box>
  )
}
