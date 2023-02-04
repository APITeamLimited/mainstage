import { Skeleton, Grid } from '@mui/material'

type StatsSkeletonProps = {
  count?: number
}

export const StatsSkeleton = ({ count = 4 }: StatsSkeletonProps) => {
  return (
    <Grid container>
      {Array.from({ length: count }).map((_, index) => (
        <Grid
          sx={{
            marginRight: 2,
            marginBottom: 2,
          }}
          key={index}
        >
          <Skeleton width={123.44} height={74.38} />
        </Grid>
      ))}
    </Grid>
  )
}
