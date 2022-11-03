import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { Headline } from 'src/layouts/Landing/components/templates/Headline'

import { Markdown } from '../../components/utils/Markdown'

import privacyPolicy from './privacy-policy.md'

const PrivacyPolicyPage = () => {
  return (
    <>
      <MetaTags title="Privacy Policy" />
      <Stack spacing={2}>
        <Headline headline="Privacy Policy" padBottom />
        <Markdown>{privacyPolicy}</Markdown>
      </Stack>
    </>
  )
}

export default PrivacyPolicyPage
