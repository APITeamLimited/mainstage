import {
  Grid,
  Stack,
  Typography,
  Paper,
  useTheme,
  Divider,
  useMediaQuery,
} from '@mui/material'
import { NewsletterSignup } from 'src/components/landing/NewsletterSignup'
import { Headline } from 'src/pages/splash/components/Headline'

const UnionJackGrid = (
  <Grid item xs={12} md={6} style={{ textAlign: 'center' }} marginBottom={6}>
    <img
      src={require('web/public/img/union-jack.jpg')}
      alt="Union Jack"
      width="300px"
    />
  </Grid>
)

const AboutPage = () => {
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <Stack spacing={6}>
      <Headline headline="About Us" sublines={['Our beliefs and values']} />
      <Grid container>
        <Grid item xs={12} md={6} marginBottom={6}>
          <Typography
            variant="h4"
            gutterBottom
            color={theme.palette.text.primary}
          >
            Delivering great value
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            color={theme.palette.text.secondary}
          >
            We were founded on the belief collaborative API testing should not
            be expensive as it currently is.
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            color={theme.palette.text.secondary}
          >
            We don't limit the number of team members that you can have on our
            paid plans.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6} style={{ textAlign: 'center' }}></Grid>
      </Grid>
      <Grid container>
        {isMd ? UnionJackGrid : null}
        <Grid item xs={12} md={6} marginBottom={6}>
          <Typography
            variant="h4"
            gutterBottom
            color={theme.palette.text.primary}
          >
            Proudly British
          </Typography>
          <Typography
            variant="h6"
            gutterBottom
            color={theme.palette.text.secondary}
          >
            We are proud to be a British company and 100% based in the UK.
          </Typography>
        </Grid>
        {isMd ? null : UnionJackGrid}
      </Grid>
      <Divider />
      <NewsletterSignup />
    </Stack>
  )
}

export default AboutPage
