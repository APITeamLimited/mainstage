import {
  Box,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Chip,
} from '@mui/material'
import { AllPlansQuery } from 'types/graphql'

import { usePlanInfo } from 'src/contexts/billing-info'

type SupportedLoadZonesProps = {
  nextPlan: AllPlansQuery['planInfos'][0] | null
}

export const SupportedLoadZones = ({ nextPlan }: SupportedLoadZonesProps) => {
  const theme = useTheme()
  const planInfo = usePlanInfo()

  return planInfo ? (
    <Stack spacing={2}>
      <Typography variant="body1" fontWeight="bold">
        Supported Load Zones
      </Typography>
      <Box
        style={{
          marginBottom: theme.spacing(-1),
        }}
      >
        {planInfo.loadZones.map((lz) => (
          <Chip
            key={lz}
            label={lz}
            size="small"
            variant="filled"
            sx={{
              marginRight: 1,
              marginBottom: 1,
            }}
          />
        ))}
        {
          // Find load zones that are not supported by the current plan
          nextPlan &&
            nextPlan.loadZones
              .filter((lz) => !planInfo.loadZones.includes(lz))
              .map((lz) => (
                <Tooltip
                  key={lz}
                  title={`Upgrade to ${nextPlan.name} to access ${lz}`}
                  placement="top"
                >
                  <span>
                    <Chip
                      label={lz}
                      size="small"
                      variant="filled"
                      sx={{
                        marginRight: 1,
                        marginBottom: 1,
                      }}
                      disabled
                    />
                  </span>
                </Tooltip>
              ))
        }
      </Box>
    </Stack>
  ) : (
    <Skeleton variant="text" height={20} />
  )
}
