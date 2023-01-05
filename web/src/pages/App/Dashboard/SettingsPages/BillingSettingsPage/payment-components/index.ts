import { Theme } from '@mui/material'
import { StripeElementsOptions } from '@stripe/stripe-js'

export * from './CardFrame'

export const getDefaultElementsOptions = (
  theme: Theme
): StripeElementsOptions => ({
  loader: 'always',
  appearance: {
    theme: theme.palette.mode === 'dark' ? 'night' : 'stripe',

    variables: {
      fontFamily: theme.typography.fontFamily,
      colorBackground: 'transparent',

      spacingUnit: theme.spacing(0.5),
      spacingGridRow: theme.spacing(2),
      spacingGridColumn: theme.spacing(2),
      spacingTab: theme.spacing(2),
      spacingAccordionItem: theme.spacing(2),
    },
  },
})

export const stripeCountries = [
  { country: 'Argentina', code: 'AR' },
  { country: 'Australia', code: 'AU' },
  { country: 'Austria', code: 'AT' },
  { country: 'Belgium', code: 'BE' },
  { country: 'Bolivia', code: 'BO' },
  { country: 'Brazil', code: 'BR' },
  { country: 'Bulgaria', code: 'BG' },
  { country: 'Canada', code: 'CA' },
  { country: 'Chile', code: 'CL' },
  { country: 'Colombia', code: 'CO' },
  { country: 'Costa Rica', code: 'CR' },
  { country: 'Croatia', code: 'HR' },
  { country: 'Cyprus', code: 'CY' },
  { country: 'Czech Republic', code: 'CZ' },
  { country: 'Denmark', code: 'DK' },
  { country: 'Dominican Republic', code: 'DO' },
  { country: 'Estonia', code: 'EE' },
  { country: 'Finland', code: 'FI' },
  { country: 'France', code: 'FR' },
  { country: 'Germany', code: 'DE' },
  { country: 'Greece', code: 'GR' },
  { country: 'Hong Kong SAR China', code: 'HK' },
  { country: 'Hungary', code: 'HU' },
  { country: 'Iceland', code: 'IS' },
  { country: 'India', code: 'IN' },
  { country: 'Indonesia', code: 'ID' },
  { country: 'Ireland', code: 'IE' },
  { country: 'Israel', code: 'IL' },
  { country: 'Italy', code: 'IT' },
  { country: 'Japan', code: 'JP' },
  { country: 'Latvia', code: 'LV' },
  { country: 'Liechtenstein', code: 'LI' },
  { country: 'Lithuania', code: 'LT' },
  { country: 'Luxembourg', code: 'LU' },
  { country: 'Malta', code: 'MT' },
  { country: 'Mexico ', code: 'MX' },
  { country: 'Netherlands', code: 'NL' },
  { country: 'New Zealand', code: 'NZ' },
  { country: 'Norway', code: 'NO' },
  { country: 'Paraguay', code: 'PY' },
  { country: 'Peru', code: 'PE' },
  { country: 'Poland', code: 'PL' },
  { country: 'Portugal', code: 'PT' },
  { country: 'Romania', code: 'RO' },
  { country: 'Singapore', code: 'SG' },
  { country: 'Slovakia', code: 'SK' },
  { country: 'Slovenia', code: 'SI' },
  { country: 'Spain', code: 'ES' },
  { country: 'Sweden', code: 'SE' },
  { country: 'Switzerland', code: 'CH' },
  { country: 'Thailand', code: 'TH' },
  { country: 'Trinidad & Tobago', code: 'TT' },
  { country: 'United Arab Emirates', code: 'AE' },
  { country: 'United Kingdom', code: 'GB' },
  { country: 'United States', code: 'US' },
  { country: 'Uruguay', code: 'UY' },
] as const

export const countryCodes = stripeCountries.map((c) => c.code)
