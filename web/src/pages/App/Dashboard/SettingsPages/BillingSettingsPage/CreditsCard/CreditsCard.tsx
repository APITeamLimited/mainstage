import { useState } from 'react'

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

import { BuyCreditsDialog } from './BuyCreditsDialog'

const creditsCardMinHeight = 200

export const CreditsCard = () => {
  const credits = useCredits()
  const planInfo = usePlanInfo()

  const [showBuyCreditsDialog, setShowBuyCreditsDialog] = useState(false)

  return credits && planInfo ? (
    <>
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
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowBuyCreditsDialog(true)}
            >
              Buy Credits
            </Button>
          </Stack>
        </Stack>
      </Card>
      <BuyCreditsDialog
        open={showBuyCreditsDialog}
        setOpen={setShowBuyCreditsDialog}
      />
    </>
  ) : (
    <Skeleton height={creditsCardMinHeight} />
  )
}
