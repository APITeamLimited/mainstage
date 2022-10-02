import { Stack } from '@mui/material'
import MuiMarkdown from 'mui-markdown'

import { Headline } from 'src/pages/RootPage/components/Headline'

import tosMarkdown from './cookie-policy.md'

const CookiePolicyPage = () => {
  return (
    <Stack spacing={2}>
      <Headline headline="Cookie Policy" />
      <MuiMarkdown>{tosMarkdown}</MuiMarkdown>
    </Stack>
  )
}

export default CookiePolicyPage
