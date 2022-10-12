import { useState, useEffect, useRef } from 'react'

import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Box, CircularProgress, Tooltip, useTheme } from '@mui/material'

import { useCollection } from 'src/contexts/collection'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useVerifiedDomains } from 'src/contexts/verified-domains-provider'
import {
  createEnvironmentContext,
  findEnvironmentVariables,
} from 'src/utils/environment'

type IsVerifiedDomainBadge = {
  endpoint: string
}

const spinnerTimeoutMs = 0

export const IsVerifiedDomainBadge = ({ endpoint }: IsVerifiedDomainBadge) => {
  const theme = useTheme()

  const collectionYMap = useCollection()
  const activeEnvironmentYMap = useActiveEnvironmentYMap()

  const verifiedDomains = useVerifiedDomains()

  const [lastUpdatedTime, setLastUpdatedTime] = useState<number>(0)

  const [isVerified, setIsVerified] = useState<'yes' | 'no' | 'loading'>('no')

  const handleUpdate = () => {
    const collectionContext = collectionYMap
      ? createEnvironmentContext(
          collectionYMap,
          collectionYMap.doc?.guid as string
        )
      : null

    const environmentContext = activeEnvironmentYMap
      ? createEnvironmentContext(
          activeEnvironmentYMap,
          activeEnvironmentYMap.doc?.guid as string
        )
      : null

    const evironmnetAwareEndpoint = findEnvironmentVariables(
      environmentContext,
      collectionContext,
      endpoint
    )

    try {
      const url = new URL(evironmnetAwareEndpoint)

      const verifiedDomain = verifiedDomains?.find(
        (domain) => domain.domain === url.hostname
      )

      setIsVerified(verifiedDomain?.verified ? 'yes' : 'no')
    } catch (error) {
      setIsVerified('no')
    }

    setLastUpdatedTime(Date.now())
  }

  const handleUpdateRef = useRef(handleUpdate)

  useEffect(() => {
    // Only run update at a maximum every spinnerTimeoutMs seconds
    const timeNow = Date.now()

    if (timeNow - lastUpdatedTime < spinnerTimeoutMs) {
      // Set timeout to run update again
      const waitTime = spinnerTimeoutMs - (timeNow - lastUpdatedTime)

      setIsVerified('loading')
      setTimeout(() => handleUpdateRef.current(), waitTime)
    } else {
      // Run update
      handleUpdateRef.current()
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
        <Tooltip title="Verified domain - load test limits will be increased">
          <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
        </Tooltip>
      ) : isVerified === 'no' ? (
        <Tooltip title="Unverified domain - load test limits will be applied">
          <CancelIcon sx={{ color: theme.palette.error.main }} />
        </Tooltip>
      ) : (
        <CircularProgress size={16} />
      )}
    </Box>
  )
}
