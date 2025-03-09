"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, AlertTriangle } from "lucide-react"

export function EmailVerification() {
  const { user, sendVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [lastSent, setLastSent] = useState<Date | null>(null)

  // Check if email was sent in the last 60 seconds
  const canResend = !lastSent || (new Date().getTime() - lastSent.getTime()) > 60000

  const handleSendVerification = async () => {
    if (!canResend) {
      toast.error("Please wait before requesting another verification email")
      return
    }

    setIsLoading(true)
    try {
      await sendVerificationEmail()
      setLastSent(new Date())
      toast.success("Verification email sent")
    } catch (error) {
      console.error("Error sending verification email:", error)
      toast.error("Failed to send verification email")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.emailVerified) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Verify your email</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          Please verify your email address to access all features.
          {lastSent && (
            <span className="text-sm block mt-1">
              Last email sent: {lastSent.toLocaleTimeString()}
            </span>
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSendVerification}
          disabled={isLoading || !canResend}
          className="mt-2"
        >
          <Mail className="mr-2 h-4 w-4" />
          {isLoading
            ? "Sending..."
            : !canResend
            ? "Wait before resending"
            : "Resend verification email"}
        </Button>
      </AlertDescription>
    </Alert>
  )
} 