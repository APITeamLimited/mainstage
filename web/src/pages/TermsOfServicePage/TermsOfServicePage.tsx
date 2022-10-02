import { Stack } from '@mui/material'
import MuiMarkdown from 'mui-markdown'

import { Headline } from 'src/pages/RootPage/components/Headline'

import tosMarkdown from './terms-of-service.md'

const TermsOfServicePage = () => {
  return (
    <Stack spacing={2}>
      <Headline headline="Terms of Service" />
      <MuiMarkdown>{tosMarkdown}</MuiMarkdown>
    </Stack>
  )
}

export default TermsOfServicePage
