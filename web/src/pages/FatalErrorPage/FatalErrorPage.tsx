import { useState } from 'react'

import ErrorIcon from '@mui/icons-material/Error'
import { Box, Button, Stack, Typography, useTheme } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { ReportErrorDialog } from './ReportErrorDialog'

type FatalErrorPageProps = {
  error?: Error
}

export const FatalErrorPage = ({ error }: FatalErrorPageProps) => {
  const theme = useTheme()

  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)

  return (
    <>
      <MetaTags title="Fatal Error" />
      <ReportErrorDialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        error={error}
      />
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          position: 'fixed',
          zIndex: 10000000,
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        <main>
          <Stack spacing={4} alignItems="center" justifyContent="center">
            <ErrorIcon
              sx={{
                height: '100px',
                width: '100px',
                color: theme.palette.error.main,
              }}
            />
            <Typography variant="h6" component="h1" gutterBottom>
              Fatal Error
            </Typography>
            <Typography>
              We are sorry but something went wrong. We would love it if you
              could tell us what happened. Alternatively, you can refresh the
              page and try again.
            </Typography>
            <Button variant="contained" color="error">
              Send Feedback
            </Button>
          </Stack>
        </main>
      </Box>
    </>
  )
}
