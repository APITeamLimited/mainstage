import {
  useTheme,
  Stack,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export const NewsletterSignup = () => {
  const theme = useTheme()

  const formik = useFormik({
    initialValues: {
      email: '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Must be a valid email')
        .max(255)
        .required('Email is required'),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      throw new Error('Not implemented')
    },
  })

  return (
    <Paper
      sx={{
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <Stack margin={2} spacing={2} alignItems="center">
        <Typography
          variant="h6"
          color={theme.palette.common.white}
          align="center"
        >
          Sign Up for our newsletter
        </Typography>
        <Typography
          variant="body1"
          color={theme.palette.common.white}
          align="center"
        >
          Sign up to our newsletter to get the latest news and updates straight
          to your inbox
        </Typography>
        <Box
          sx={{
            width: '100%',
            maxWidth: '600px',
          }}
        >
          <form noValidate onSubmit={formik.handleSubmit}>
            <Stack direction="row" spacing={2}>
              <Box
                sx={{
                  width: '100%',
                }}
              >
                <TextField
                  error={Boolean(formik.touched.email && formik.errors.email)}
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  placeholder="Email Address"
                  value={formik.values.email}
                  color="success"
                  variant="outlined"
                  sx={{
                    color: theme.palette.common.white,
                    borderColor: theme.palette.common.white,
                    width: '100%',
                    '& .MuiInputLabel-root': {
                      color: theme.palette.common.white,
                    }, //styles the label
                    '& .MuiOutlinedInput-root': {
                      '& > fieldset': {
                        borderColor: theme.palette.common.white,
                      },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      '& > fieldset': {
                        borderColor: `${theme.palette.common.white} !important`,
                      },
                    },
                  }}
                  InputProps={{
                    sx: {
                      color: theme.palette.common.white,

                      borderColor: theme.palette.common.white,
                    },
                  }}
                  size="small"
                />
              </Box>
              <Button
                variant="outlined"
                color="success"
                sx={{
                  color: theme.palette.common.white,
                  borderColor: theme.palette.common.white,
                }}
                type="submit"
                disabled={formik.isSubmitting}
              >
                <span
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  SignUp
                </span>
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Paper>
  )
}
