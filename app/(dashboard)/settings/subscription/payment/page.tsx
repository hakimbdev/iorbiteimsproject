"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { getSubscription } from "@/lib/stripe"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get("subscription_id")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handlePayment = async () => {
      if (!subscriptionId) {
        toast.error("Invalid subscription ID")
        router.push("/settings/subscription")
        return
      }

      try {
        const subscription = await getSubscription(subscriptionId)
        if (!subscription) {
          toast.error("Subscription not found")
          router.push("/settings/subscription")
          return
        }

        // In a real implementation, you would:
        // 1. Create a payment intent
        // 2. Set up Stripe Elements
        // 3. Handle the payment flow
        // For test mode, we'll simulate a successful payment
        setIsProcessing(true)
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
        toast.success("Payment processed successfully")
        router.push("/settings/subscription")
      } catch (error) {
        console.error("Error processing payment:", error)
        toast.error("Failed to process payment")
        router.push("/settings/subscription")
      } finally {
        setIsLoading(false)
      }
    }

    handlePayment()
  }, [subscriptionId, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Processing payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Processing Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              Please wait while we process your payment...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 