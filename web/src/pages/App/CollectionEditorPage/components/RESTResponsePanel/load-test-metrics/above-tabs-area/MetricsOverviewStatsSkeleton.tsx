import { Skeleton, Grid } from '@mui/material'

type MetricsOverviewStatsSkeletonProps = {
  count?: number
}

export const MetricsOverviewStatsSkeleton = (
  { count = 4 }: MetricsOverviewStatsSkeletonProps = { count: 3 }
) => {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item key={index}>
          <Skeleton width={123.44} height={72.38} />
        </Grid>
      ))}
    </Grid>
  )
}
