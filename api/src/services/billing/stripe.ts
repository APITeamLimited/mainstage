import { checkValue } from "src/config"
import { checkAuthenticated } from "../guards"

const STRIPE_PUBLISHABLE_KEY = checkValue<string>("stripe.publishableKey")

export const publishableKey = async () => {
  await checkAuthenticated()

  return STRIPE_PUBLISHABLE_KEY
}
