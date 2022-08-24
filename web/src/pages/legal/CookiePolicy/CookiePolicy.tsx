import { Headline } from "src/pages/splash/components/Headline"
import { Stack } from "@mui/material"
import MuiMarkdown from 'mui-markdown'

import tosMarkdown from './cookie-policy.md'

const CookiePolicyPage = () => {
  return <Stack spacing={2}>
  <Headline headline="Cookie Policy" />
  <MuiMarkdown>{tosMarkdown}</MuiMarkdown>
  </Stack>
}

export default CookiePolicyPage
