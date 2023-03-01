export const displayCorrectCredits = (credits: number) => {
  // Divide by 1000 to get true value
  const creditsInThousands = credits / 1000

  // Round so no decimals
  const roundedCredits = Math.round(creditsInThousands)
  // Ensure no minus sign shown
  return Math.abs(roundedCredits)
}
