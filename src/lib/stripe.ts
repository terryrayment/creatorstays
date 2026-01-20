import Stripe from 'stripe'

// Stripe instance - only created if STRIPE_SECRET_KEY is set
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : null as unknown as Stripe // Type assertion for development

// Helper to check if Stripe is configured
export const isStripeConfigured = (): boolean => {
  return !!process.env.STRIPE_SECRET_KEY
}
