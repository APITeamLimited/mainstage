import {
  Button,
  Card,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'

import { CreditsStatistics } from 'src/components/app/CreditsStatistics'
import { useCredits, usePlanInfo } from 'src/contexts/billing-info'

const creditsCardMinHeight = 200

export const CreditsCard = () => {
  const credits = useCredits()
  const planInfo = usePlanInfo()

  return credits && planInfo ? (
    <Card>
      <Stack spacing={2} p={2}>
        <Typography variant="h6" fontWeight="bold">
          Credits
        </Typography>
        <Typography variant="body2">
          Credits are used to send requests and run load tests on the cloud.
        </Typography>
        <Divider />
        <CreditsStatistics />
        <Divider />
        <Stack spacing={2} direction="row" justifyContent="flex-end">
          <Button variant="contained" color="primary" type="submit">
            Buy Credits
          </Button>
        </Stack>
      </Stack>
    </Card>
  ) : (
    <Skeleton height={creditsCardMinHeight} />
  )
}
