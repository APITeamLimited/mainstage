import { Stack, TextField, Typography, useTheme } from '@mui/material'

import {
  RESTAuth,
  RESTAuthBearer,
  RESTAuthOAuth2,
} from 'src/contexts/reactives'

type OAuth2AuthFormProps = {
  auth: RESTAuthOAuth2
  setAuth: (auth: RESTAuth) => void
  requestId: string
}

export const OAuth2AuthForm = ({
  auth,
  setAuth,
  requestId,
}: OAuth2AuthFormProps) => {
  const theme = useTheme()

  return <>Todo - OAuth2AuthForm</>
}
