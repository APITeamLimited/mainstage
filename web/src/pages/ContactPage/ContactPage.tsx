import { Stack } from '@mui/material'

import { panelSeparation } from 'src/layouts/Landing/components/constants'
import { Headline } from 'src/layouts/Landing/components/templates/Headline'

import { ContactUs } from './components/ContactUs'
import { DocsHelp } from './components/DocsHelp'

const ContactPage = () => {
  return (
    <Stack spacing={panelSeparation}>
      <Headline
        headline="Contact Us"
        sublines={['We are here to help you with any questions you might have']}
      />
      <ContactUs />
      <DocsHelp />
    </Stack>
  )
}

export default ContactPage
