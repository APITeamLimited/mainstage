import { Skeleton, Grid } from '@mui/material'

type StatsSkeletonProps = {
  count?: number
}

export const StatsSkeleton = ({ count = 4 }: StatsSkeletonProps) => {
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
