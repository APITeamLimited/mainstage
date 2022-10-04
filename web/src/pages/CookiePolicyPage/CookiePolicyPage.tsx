import { Stack } from '@mui/material'

import { Headline } from 'src/pages/RootPage/components/Headline'

import { Markdown } from '../../components/utils/Markdown'

import cookiePolicy from './cookie-policy.md'

const CookiePolicyPage = () => {
  return (
    <Stack spacing={2}>
      <Headline headline="Cookie Policy" />
      <Markdown>{cookiePolicy}</Markdown>
    </Stack>
  )
}

export default CookiePolicyPage
