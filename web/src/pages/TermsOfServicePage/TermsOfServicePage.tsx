import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { Headline } from 'src/pages/RootPage/components/Headline'

import { Markdown } from '../../components/utils/Markdown'

import tosMarkdown from './terms-of-service.md'

const TermsOfServicePage = () => {
  return (
    <>
      <MetaTags title="Terms of Service" />
      <Stack spacing={2}>
        <Headline headline="Terms of Service" />
        <Markdown>{tosMarkdown}</Markdown>
      </Stack>
    </>
  )
}

export default TermsOfServicePage
