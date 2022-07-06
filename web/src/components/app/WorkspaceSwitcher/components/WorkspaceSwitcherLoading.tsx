import { Box } from '@mui/material'
import ContentLoader from 'react-content-loader'

export const WorkspaceSwitcherLoading = () => (
  <Box
    sx={{
      mt: 0.5,
    }}
  >
    <ContentLoader width={199} height={40}>
      <rect x="0" y="0" rx="8" ry="8" width="199" height="40" />
    </ContentLoader>
  </Box>
)
