import { Container } from '@mui/material'
import { Headline } from 'src/pages/splash/components/Headline'

const WhyAPITeamPage = () => {
  return (
   <Headline
        headline="Why APITeam?"
        sublines={[
          'APITeam is a platform for designing, testing and scaling your APIs collaboratively',
          'While saving time and money',
        ]}
      />
  )
}

export default WhyAPITeamPage
