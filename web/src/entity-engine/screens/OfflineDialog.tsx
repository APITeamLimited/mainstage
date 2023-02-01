import { useState, useEffect } from 'react'

import WifiOffIcon from '@mui/icons-material/WifiOff'
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
} from '@mui/material'

export const OfflineDialog = () => {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const handleOffline = () => setOffline(true)
    const handleOnline = () => setOffline(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return (
    <Dialog open={offline}>
      <DialogTitle>Offline</DialogTitle>
      <DialogContent
        sx={{
          paddingBottom: 0,
        }}
      >
        <DialogContentText>
          You are currently offline. Please check your internet connection.
        </DialogContentText>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <WifiOffIcon color="action" sx={{ fontSize: 100 }} />
        </Box>
      </DialogContent>
    </Dialog>
  )
}
