import { useState, useEffect } from 'react'

import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, CircularProgress, Tooltip, useTheme } from '@mui/material'
import extractDomain from 'extract-domain'

import {
  useCollectionVariables,
  useEnvironmentVariables,
} from 'src/contexts/VariablesProvider'
import { useVerifiedDomains } from 'src/contexts/verified-domains-provider'
import { findEnvironmentVariables } from 'src/utils/environment'

type IsVerifiedDomainBadgeProps = {
  endpoint: string
}

export const IsVerifiedDomainBadge = ({
  endpoint,
}: IsVerifiedDomainBadgeProps) => {
  const theme = useTheme()

  const verifiedDomains = useVerifiedDomains()
  const [isVerified, setIsVerified] = useState<'yes' | 'no' | 'loading'>('no')

  const collectionContext = useCollectionVariables()
  const environmentContext = useEnvironmentVariables()

  useEffect(() => {
    let environmentAwareEndpoint = findEnvironmentVariables(
      environmentContext,
      collectionContext,
      endpoint
    )

    // Check if starts with http:// or https://
    if (
      !environmentAwareEndpoint.startsWith('http://') &&
      !environmentAwareEndpoint.startsWith('https://')
    ) {
      environmentAwareEndpoint = `https://${environmentAwareEndpoint}`
    }

    try {
      const url = new URL(environmentAwareEndpoint)
      const extractedDomain = extractDomain(url.hostname)

      const verifiedSubdomain = verifiedDomains.find(
        (verifiedDomain) => verifiedDomain.domain === extractedDomain
      )

      if (verifiedSubdomain) {
        setIsVerified('yes')
        return
      }
      setIsVerified('no')
    } catch (error) {
      setIsVerified('no')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, verifiedDomains])

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
      ) : (
        <CircularProgress size={16} />
      )}
    </Box>
  )
}
