import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { Headline } from 'src/pages/RootPage/components/Headline'

import { Markdown } from '../../components/utils/Markdown'

import cookiePolicy from './cookie-policy.md'

const CookiePolicyPage = () => {
  return (
    <>
      <MetaTags title="Cookie Policy" />
      <Stack spacing={2}>
        <Headline headline="Cookie Policy" />
        <Markdown>{cookiePolicy}</Markdown>
      </Stack>
    </>
  )
}

export default CookiePolicyPage
