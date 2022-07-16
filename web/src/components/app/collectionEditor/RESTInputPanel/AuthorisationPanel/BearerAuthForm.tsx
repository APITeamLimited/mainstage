import { RESTAuth, RESTAuthBearer } from 'src/contexts/reactives'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Stack, TextField, Typography, useTheme } from '@mui/material'

type BearerAuthFormProps = {
  auth: RESTAuthBearer & { authActive: boolean }
  setAuth: (auth: RESTAuth) => void
}

export const BearerAuthForm = ({ auth, setAuth }: BearerAuthFormProps) => {
  const theme = useTheme()
  const formik = useFormik({
    initialValues: {
      token: auth.token,
    },
    validationSchema: Yup.object({
      token: Yup.string().required('Bearer token is required'),
    }),
    onSubmit: (values) => {
      setAuth({
        authType: 'bearer',
        authActive: true,
        token: values.token,
      })
    },
  })

  return (
    <form noValidate onSubmit={formik.handleSubmit} style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Stack alignItems='flex-start' spacing={2} sx={{
        display: 'flex',
        width: '100%',
      }}>
        <Typography variant='body2' color={theme.palette.text.primary}>
          Bearer tokens are sometimes called Access Tokens
        </Typography>
        <TextField
          label="Bearer"
          name="token"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.token}
          helperText={formik.touched.token && formik.errors.token}
          error={Boolean(formik.touched.token && formik.errors.token)}
          fullWidth
        />
      </Stack>
    </form>
  )
}
