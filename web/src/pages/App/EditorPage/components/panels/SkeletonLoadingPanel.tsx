import { Skeleton, Box } from '@mui/material'

export const SkeletonLoadingPanel = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Skeleton
      sx={{
        margin: 2,
        flex: 1,
      }}
    />
  </Box>
)
