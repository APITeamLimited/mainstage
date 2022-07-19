import { Stack, TextField, useTheme } from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { EnvironmentTextField } from 'src/components/app/EnvironmentManager'
import { RESTAuth, RESTAuthBasic } from 'src/contexts/reactives'

type BasicAuthFormProps = {
  auth: RESTAuthBasic & { authActive: boolean }
  setAuth: (auth: RESTAuth) => void
  requestId: string
}

export const BasicAuthForm = ({
  auth,
  setAuth,
  requestId,
}: BasicAuthFormProps) => {
  const theme = useTheme()
  const formik = useFormik({
    initialValues: {
      username: auth.username,
      password: auth.password,
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => {
      setAuth({
        authType: 'basic',
        authActive: true,
        username: values.username,
        password: values.password,
      })
    },
    handleChange: (values) => {},
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
          label="Username"
          name="username"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.username}
          helperText={formik.touched.username && formik.errors.username}
          error={Boolean(formik.touched.username && formik.errors.username)}
          fullWidth
        />
        <TextField
          label="Password"
          name="password"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.password}
          helperText={formik.touched.password && formik.errors.password}
          error={Boolean(formik.touched.password && formik.errors.password)}
          fullWidth
        />
        <EnvironmentTextField
          label="Username"
          namespace={`${requestId}.username`}
          onChange={(value) => {
            formik.setFieldValue('username', value)
            //formik.setFieldTouched('username', true)
          }}
          value={formik.values.username}
          helperText={formik.touched.username && formik.errors.username}
          error={Boolean(formik.touched.username && formik.errors.username)}
        />
        <EnvironmentTextField
          label="Password"
          namespace={`${requestId}.password`}
          onChange={(value) => {
            formik.setFieldValue('password', value)
            //formik.setFieldTouched('password', true)
          }}
          value={formik.values.password}
          helperText={formik.touched.password && formik.errors.password}
          error={Boolean(formik.touched.password && formik.errors.password)}
        />
      </Stack>
    </form>
  )
}
