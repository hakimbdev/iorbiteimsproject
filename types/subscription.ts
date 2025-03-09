export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  stripeProductId: string;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: string;
  updatedAt: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    interval: 'month',
    features: [
      'Up to 50 property listings',
      'Up to 100 client profiles',
      'Basic analytics',
      'Email support',
      'Mobile app access'
    ],
    stripePriceId: 'price_basic_monthly', // Replace with actual Stripe price ID
    stripeProductId: 'prod_basic' // Replace with actual Stripe product ID
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'month',
    features: [
      'Up to 200 property listings',
      'Up to 500 client profiles',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom branding',
      'Team collaboration'
    ],
    stripePriceId: 'price_professional_monthly', // Replace with actual Stripe price ID
    stripeProductId: 'prod_professional' // Replace with actual Stripe product ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: [
      'Unlimited property listings',
      'Unlimited client profiles',
      'Custom analytics',
      '24/7 support',
      'Advanced API access',
      'White-label options',
      'Dedicated account manager',
      'Custom integrations'
    ],
    stripePriceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    stripeProductId: 'prod_enterprise' // Replace with actual Stripe product ID
  }
]; 