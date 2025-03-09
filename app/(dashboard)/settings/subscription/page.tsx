"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/types/subscription"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import { createStripeCustomer, createSubscription, cancelSubscription } from "@/lib/stripe"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      if (!auth.currentUser) return

      try {
        const userDoc = await getDocs(
          query(collection(db, "users"), where("id", "==", auth.currentUser.uid))
        )
        const userData = userDoc.docs[0].data()
        const companyId = userData.companyId

        const subscriptionQuery = query(
          collection(db, "subscriptions"),
          where("companyId", "==", companyId),
          where("status", "==", "active")
        )
        const subscriptionSnapshot = await getDocs(subscriptionQuery)
        
        if (!subscriptionSnapshot.empty) {
          const subscriptionData = subscriptionSnapshot.docs[0].data()
          setCurrentPlan(subscriptionData.planId)
        }
      } catch (error) {
        console.error("Error fetching subscription:", error)
        toast.error("Failed to fetch subscription details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentSubscription()
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (!auth.currentUser) return

    setIsProcessing(true)
    try {
      const userDoc = await getDocs(
        query(collection(db, "users"), where("id", "==", auth.currentUser.uid))
      )
      const userData = userDoc.docs[0].data()
      const companyId = userData.companyId
      const companyName = userData.companyName

      // Create or get Stripe customer
      const customer = await createStripeCustomer(auth.currentUser.email!, companyName)

      // Get selected plan
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
      if (!plan) throw new Error("Invalid plan selected")

      // Create subscription
      const subscription = await createSubscription(
        customer.id,
        plan.stripePriceId,
        companyId,
        planId
      )

      // Handle payment
      const paymentIntent = subscription.latest_invoice as any
      if (paymentIntent.payment_intent) {
        // Redirect to payment page or handle payment flow
        router.push(`/settings/subscription/payment?subscription_id=${subscription.id}`)
      } else {
        setCurrentPlan(planId)
        toast.success("Subscription created successfully")
      }
    } catch (error) {
      console.error("Error creating subscription:", error)
      toast.error("Failed to create subscription")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!currentPlan) return

    setIsProcessing(true)
    try {
      const userDoc = await getDocs(
        query(collection(db, "users"), where("id", "==", auth.currentUser.uid))
      )
      const userData = userDoc.docs[0].data()
      const companyId = userData.companyId

      const subscriptionQuery = query(
        collection(db, "subscriptions"),
        where("companyId", "==", companyId),
        where("status", "==", "active")
      )
      const subscriptionSnapshot = await getDocs(subscriptionQuery)
      
      if (!subscriptionSnapshot.empty) {
        const subscriptionData = subscriptionSnapshot.docs[0].data()
        await cancelSubscription(subscriptionData.stripeSubscriptionId)
        setCurrentPlan(null)
        toast.success("Subscription cancelled successfully")
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error)
      toast.error("Failed to cancel subscription")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <div>Loading subscription details...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
        {currentPlan && (
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel Subscription
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              currentPlan === plan.id ? "border-primary" : ""
            }`}
          >
            {currentPlan === plan.id && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                ${plan.price}
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => handleSubscribe(plan.id)}
                disabled={isProcessing || currentPlan === plan.id}
              >
                {currentPlan === plan.id
                  ? "Current Plan"
                  : isProcessing
                  ? "Processing..."
                  : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 