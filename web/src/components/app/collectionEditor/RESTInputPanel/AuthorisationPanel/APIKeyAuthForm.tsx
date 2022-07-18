import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { RESTAuth, RESTAuthAPIKey } from 'src/contexts/reactives'

type APIKeyAuthFormProps = {
  auth: RESTAuthAPIKey & { authActive: boolean }
  setAuth: (auth: RESTAuth) => void
}

export const APIKeyAuthForm = ({ auth, setAuth }: APIKeyAuthFormProps) => {
  const theme = useTheme()
  const formik = useFormik({
    initialValues: {
      key: auth.key,
      value: auth.value,
      addTo: 'header',
    },
    validationSchema: Yup.object({
      key: Yup.string().required('Key is required'),
      value: Yup.string().required('Value is required'),
    }),
    onSubmit: (values) => {
      setAuth({
        authType: 'api-key',
        authActive: true,
        key: values.key,
        value: values.value,
        addTo: values.addTo,
      })
    },
  })

  return (
    <form
      noValidate
      onSubmit={formik.handleSubmit}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Stack
        alignItems="flex-start"
        spacing={2}
        sx={{
          display: 'flex',
          width: '100%',
        }}
      >
        <TextField
          label="Key"
          name="key"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.key}
          helperText={formik.touched.key && formik.errors.key}
          error={Boolean(formik.touched.key && formik.errors.key)}
          fullWidth
        />
        <TextField
          label="Value"
          name="value"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.value}
          helperText={formik.touched.value && formik.errors.value}
          error={Boolean(formik.touched.value && formik.errors.value)}
          fullWidth
        />
        <div>
          <FormLabel>Add To</FormLabel>
          <RadioGroup row name="addTo">
            <FormControlLabel
              value="header"
              control={<Radio />}
              label="Headers"
            />
            <FormControlLabel
              value="query"
              control={<Radio />}
              label="Query Parameters"
            />
          </RadioGroup>
        </div>
      </Stack>
    </form>
  )
}
