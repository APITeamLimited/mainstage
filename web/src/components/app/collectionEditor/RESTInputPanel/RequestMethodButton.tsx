/* eslint-disable jsx-a11y/no-autofocus */
import { useState, useRef } from 'react'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {
  Popover,
  Button,
  Stack,
  MenuItem,
  Dialog,
  DialogContent,
  DialogContentText,
  TextField,
  DialogTitle,
  DialogActions,
  Box,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const defaultRequestOptions = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'TRACE',
  'Custom',
]

type RequestMethodButtonProps = {
  requestMethod: string
  setRequestMethod: (requestMethod: string) => void
}

export const RequestMethodButton = ({
  requestMethod,
  setRequestMethod,
}: RequestMethodButtonProps) => {
  const [showPopover, setShowPopover] = useState(false)
  const [showCustomRequestMethodDialog, setShowCustomRequestMethodDialog] =
    useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      // Ensure name contains no spaces
      name: Yup.string()
        .required('Method name is required')
        .max(255)
        .test('no-spaces', 'Method name cannot contain spaces', (value) => {
          return !value?.includes(' ')
        }),
    }),
    onSubmit: async (values) => {
      setRequestMethod(values.name.toUpperCase())
      handleCloseCustomRequestMethodDialog()
    },
  })

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>
  ) => {
    const requestMethod = event.currentTarget.innerText

    if (requestMethod === 'Custom') {
      setShowCustomRequestMethodDialog(true)
    } else {
      setRequestMethod(requestMethod)
      setShowPopover(false)
    }
  }

  const handleCloseCustomRequestMethodDialog = () => {
    setShowCustomRequestMethodDialog(false)
    formik.resetForm()
    setShowPopover(false)
  }

  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <Button
        variant="contained"
        color="secondary"
        sx={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        ref={buttonRef}
        onClick={() => setShowPopover(true)}
        endIcon={<ArrowDropDownIcon />}
      >
        {requestMethod}
      </Button>
      <Popover
        anchorEl={buttonRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setShowPopover(false)}
        open={showPopover}
        sx={{
          mt: 1,
        }}
      >
        <Stack>
          {defaultRequestOptions.map((option) => (
            <MenuItem
              key={option}
              onClick={handleMenuItemClick}
              selected={requestMethod === option}
            >
              {option}
            </MenuItem>
          ))}
        </Stack>
      </Popover>
      <Dialog
        open={showCustomRequestMethodDialog}
        onClose={handleCloseCustomRequestMethodDialog}
      >
        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogTitle>Custom Request Type</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Enter the name of the custom request type e.g. PURGE, LINK, FIND,
              etc.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              fullWidth
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCustomRequestMethodDialog}>
              Cancel
            </Button>
            <Button disabled={formik.isSubmitting} type="submit">
              Set
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
