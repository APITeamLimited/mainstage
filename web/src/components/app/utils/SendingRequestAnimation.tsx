import { LinearProgress } from '@mui/material'

export const SendingRequestAnimation = () => (
  <LinearProgress
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    }}
  />
)
