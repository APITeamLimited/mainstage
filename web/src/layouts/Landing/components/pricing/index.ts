export * from './PricingOverview'
export * from './CreditsPricingOptionCard'

// Format numbers as K or M
export const numberFormatter = Intl.NumberFormat('en-US', {
  notation: 'compact',
})

export const prettyPrintCents = (cents: number): string => {
  const dollars = cents / 100

  // Round to 2 decimal places and format as currency
  return dollars.toLocaleString('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
