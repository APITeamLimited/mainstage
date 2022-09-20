import { Stack } from '@mui/material'
import MuiMarkdown from 'mui-markdown'

import { Headline } from 'src/pages/splash/components/Headline'

import tosMarkdown from './privacy-policy.md'

const PrivacyPolicyPage = () => {
  return (
    <Stack spacing={2}>
      <Headline headline="Privacy Policy" />
      <MuiMarkdown>{tosMarkdown}</MuiMarkdown>
    </Stack>
  )
}

export default PrivacyPolicyPage
