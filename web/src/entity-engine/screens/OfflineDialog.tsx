import { useState, useEffect } from 'react'

import WifiOffIcon from '@mui/icons-material/WifiOff'
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  CircularProgress,
} from '@mui/material'

import { PossibleSyncStatus } from '../utils'

type OfflineDialogProps = {
  socketioSyncStatus: PossibleSyncStatus
}

export const OfflineDialog = ({ socketioSyncStatus }: OfflineDialogProps) => {
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
    <Dialog
      open={
        offline ||
        socketioSyncStatus === 'disconnected' ||
        socketioSyncStatus === 'connecting'
      }
    >
      <DialogTitle>Offline</DialogTitle>
      <DialogContent
        sx={{
          paddingBottom: 0,
        }}
      >
        <DialogContentText>
          {offline
            ? 'You are currently offline. Please check your internet connection.'
            : 'Disconnected from APITeam servers, we are attempting to reconnect. If this persists, please reload the page.'}
        </DialogContentText>
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          {offline ? (
            <WifiOffIcon color="action" sx={{ fontSize: 100 }} />
          ) : (
            <CircularProgress
              sx={{
                height: 100,
                width: 100,
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}
