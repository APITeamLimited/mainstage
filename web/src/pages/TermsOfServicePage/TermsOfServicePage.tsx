import { Stack } from '@mui/material'

import { Headline } from 'src/pages/RootPage/components/Headline'

import { Markdown } from '../../components/utils/Markdown'

import tosMarkdown from './terms-of-service.md'

const TermsOfServicePage = () => {
  return (
    <Stack spacing={2}>
      <Headline headline="Terms of Service" />
      <Markdown>{tosMarkdown}</Markdown>
    </Stack>
  )
}

export default TermsOfServicePage
