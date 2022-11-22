import { useState } from 'react'

import {
  Alert,
  Button,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { CustomDialog } from 'src/components/custom-mui'

type FeedbackDialogProps = {
  open: boolean
  onClose: () => void
  error?: Error
}

export const ReportErrorDialog = ({
  open,
  onClose,
  error,
}: FeedbackDialogProps) => {
  const [feedback, setFeedback] = useState('')

  const handleSend = async () => {
    // Make a post request to the server with the feedback
    const body = {
      feedback,
      error: error?.message ?? null,
    }

    const result = await fetch('/api/error-report', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    if (result.ok) {
      setSuccessMessage('Feedback sent successfully, thank you!')
      await new Promise((resolve) => setTimeout(resolve, 2000))
      window.location.reload()
    } else {
      setErrorMessage(
        "Error sending feedback, don't worry about submitting it again, just refresh the page."
      )
    }
  }

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <>
      <Snackbar
        open={successMessage !== ''}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorMessage !== ''}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert
          onClose={() => setErrorMessage('')}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <CustomDialog
        open={open}
        onClose={onClose}
        title="Send Feedback"
        dialogActions={
          <>
            <Button onClick={onClose} variant="contained" color="secondary">
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleSend}>
              Send Report
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Typography>
            Can you tell us what happened? When the error occurred? This will
            help us fix the problem.
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <Typography>
            A copy of the error will be sent with your report.
          </Typography>
        </Stack>
      </CustomDialog>
    </>
  )
}
