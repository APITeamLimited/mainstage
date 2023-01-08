import { LinearProgress, Skeleton, Stack, Typography } from '@mui/material'

import { useCredits } from 'src/contexts/billing-info'
import { displayCorrectCredits } from 'src/utils/display-correct-credits'

const numberFormatter = new Intl.NumberFormat('en-US')
const creditsCardMinHeight = 200

export const CreditsStatistics = () => {
  const credits = useCredits()

  return credits ? (
    <Stack spacing={2}>
      <Typography variant="body1" fontWeight="bold">
        Free Credits
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2">
          {numberFormatter.format(displayCorrectCredits(credits.freeCredits))}{' '}
          free credits remaining
        </Typography>
        <Typography variant="body2">
          {numberFormatter.format(
            displayCorrectCredits(credits.maxFreeCredits)
          )}{' '}
          complimentary per month
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={(credits.freeCredits / credits.maxFreeCredits) * 100}
      />
      <Typography variant="body2">
        Every month you get{' '}
        {numberFormatter.format(displayCorrectCredits(credits.maxFreeCredits))}{' '}
        free credits to use. These will renew on{' '}
        {new Date(credits.willUpdateFreeCreditsAt).toLocaleDateString()}.
      </Typography>
      <Typography variant="body1" fontWeight="bold">
        Paid Credits
      </Typography>
      <Typography variant="body2">
        {numberFormatter.format(displayCorrectCredits(credits.paidCredits))}{' '}
        paid credits
      </Typography>
      <Typography variant="body2">
        Paid credits are only used when you run out of free credits, they never
        expire.
      </Typography>
    </Stack>
  ) : (
    <Skeleton variant="rectangular" height={creditsCardMinHeight} />
  )
}
