import { ListItemText,Divider, Stack, Box, Typography } from '@mui/material'
import { Headline } from 'src/pages/splash/components/Headline'
import { ContactUs } from './components/ContactUs'
import { DocsHelp } from './components/DocsHelp'

const ContactPage = () => {
  return (
    <Stack spacing={6}>
      <Headline
        headline="Contact Us"
        sublines={['We are here to help you with any questions you might have']}
      />
      <Divider />
      <ContactUs />
      <Divider />
      <DocsHelp />
    </Stack>
  )
}

export default ContactPage
