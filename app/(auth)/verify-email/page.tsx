"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [lastSent, setLastSent] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    // If user is verified, redirect to dashboard
    if (user?.emailVerified) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Check if email was sent in the last 60 seconds
  const canResend = !lastSent || (new Date().getTime() - lastSent.getTime()) > 60000

  const handleResendVerification = async () => {
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            Please check your email and click the verification link to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto">
              <Mail className="w-8 h-8 mx-auto" />
            </div>
            <div>
              <p className="font-medium">Verification email sent to:</p>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            {lastSent && (
              <p className="text-sm text-muted-foreground">
                Last email sent: {lastSent.toLocaleTimeString()}
              </p>
            )}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendVerification}
                disabled={isLoading || !canResend}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : !canResend ? (
                  "Wait before resending"
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend verification email
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/login")}
              >
                Back to Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 