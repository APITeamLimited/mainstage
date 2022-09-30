import { makeVar, useReactiveVar } from '@apollo/client'
import { Alert, Snackbar } from '@mui/material'

export const snackSuccessMessageVar = makeVar<string | null>(null)
export const snackErrorMessageVar = makeVar<string | null>(null)

export const SnackbarProvider = () => {
  const snackSuccessMessage = useReactiveVar(snackSuccessMessageVar)
  const snackErrorMessage = useReactiveVar(snackErrorMessageVar)

  return (
    <>
      <Snackbar
        open={!!snackErrorMessage}
        onClose={() => snackErrorMessageVar(null)}
        autoHideDuration={5000}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackErrorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!snackSuccessMessage}
        onClose={() => snackSuccessMessageVar(null)}
        autoHideDuration={5000}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackSuccessMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
