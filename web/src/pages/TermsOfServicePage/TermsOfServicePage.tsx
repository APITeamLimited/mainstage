import { Stack } from '@mui/material'

import { MetaTags } from '@redwoodjs/web'

import { Markdown } from 'src/components/utils/Markdown'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'

import tosMarkdown from './terms-of-service.md'

const TermsOfServicePage = () => {
  return (
    <>
      <MetaTags title="Terms of Service" />
      <Stack spacing={2}>
        <Headline headline="Terms of Service" padBottom />
        <Markdown>{tosMarkdown}</Markdown>
      </Stack>
    </>
  )
}

export default TermsOfServicePage
