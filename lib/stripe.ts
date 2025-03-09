import Stripe from 'stripe';
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import type { Subscription, SubscriptionPlan } from '@/types/subscription';

// Initialize Stripe with test mode
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createStripeCustomer(email: string, companyName: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name: companyName,
      metadata: {
        test_mode: 'true',
      },
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}

export async function createSubscription(
  customerId: string,
  priceId: string,
  companyId: string,
  planId: string
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        companyId,
        planId,
        test_mode: 'true',
      },
    });

    // Store subscription in Firestore
    const subscriptionRef = doc(collection(db, 'subscriptions'), subscription.id);
    await setDoc(subscriptionRef, {
      id: subscription.id,
      companyId,
      planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    
    // Update subscription in Firestore
    const subscriptionRef = doc(collection(db, 'subscriptions'), subscriptionId);
    await updateDoc(subscriptionRef, {
      status: subscription.status,
      updatedAt: new Date().toISOString(),
    });

    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function updateSubscription(
  subscriptionId: string,
  priceId: string
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
      proration_behavior: 'always_invoice',
    });

    // Update subscription in Firestore
    const subscriptionRef = doc(collection(db, 'subscriptions'), subscriptionId);
    await updateDoc(subscriptionRef, {
      status: updatedSubscription.status,
      updatedAt: new Date().toISOString(),
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string): Promise<Subscription | null> {
  try {
    const subscriptionRef = doc(collection(db, 'subscriptions'), subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      return null;
    }

    return subscriptionDoc.data() as Subscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
}

export async function createTestPaymentMethod() {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2024,
        cvc: '314',
        billing_details: {
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      metadata: {
        test_mode: 'true',
      },
    });
    return paymentMethod;
  } catch (error) {
    console.error('Error creating test payment method:', error);
    throw error;
  }
}

export async function handleWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionRef = doc(collection(db, 'subscriptions'), subscription.id);
        await updateDoc(subscriptionRef, {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: new Date().toISOString(),
        });
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionRef = doc(collection(db, 'subscriptions'), invoice.subscription as string);
        await updateDoc(subscriptionRef, {
          status: 'active',
          updatedAt: new Date().toISOString(),
        });
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionRef = doc(collection(db, 'subscriptions'), invoice.subscription as string);
        await updateDoc(subscriptionRef, {
          status: 'past_due',
          updatedAt: new Date().toISOString(),
        });
        break;
      }
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    throw error;
  }
} 