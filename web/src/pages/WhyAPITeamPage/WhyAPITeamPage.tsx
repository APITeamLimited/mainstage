import { Container } from '@mui/material'

import { Headline } from 'src/pages/RootPage/components/Headline'

const WhyAPITeamPage = () => {
  return (
    <Headline
      headline="Why APITeam?"
      sublines={[
        'APITeam is a platform for designing, testing and scaling APIs collaboratively',
        'While saving time and money',
      ]}
    />
  )
}

export default WhyAPITeamPage
