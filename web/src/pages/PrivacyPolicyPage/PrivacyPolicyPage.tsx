import { Stack } from '@mui/material'

import { Headline } from 'src/pages/RootPage/components/Headline'

import { Markdown } from '../../components/utils/Markdown'

import privacyPolicy from './privacy-policy.md'

const PrivacyPolicyPage = () => {
  return (
    <Stack spacing={2}>
      <Headline headline="Privacy Policy" />
      <Markdown>{privacyPolicy}</Markdown>
    </Stack>
  )
}

export default PrivacyPolicyPage
