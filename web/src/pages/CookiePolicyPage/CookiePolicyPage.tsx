import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { Markdown } from 'src/components/utils/Markdown'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'

import cookiePolicy from './cookie-policy.md'

const CookiePolicyPage = () => {
  return (
    <>
      <MetaTags title="Cookie Policy" />
      <Stack spacing={2}>
        <Headline headline="Cookie Policy" padBottom />
        <Markdown>{cookiePolicy}</Markdown>
      </Stack>
    </>
  )
}

export default CookiePolicyPage
