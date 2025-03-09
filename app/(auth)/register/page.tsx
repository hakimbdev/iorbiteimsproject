"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { createCompany } from "@/lib/firebase"
import type { Company } from "@/types"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)

      // Basic validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast.error("Please enter your full name")
        return
      }

      if (!formData.email.trim()) {
        toast.error("Please enter your email")
        return
      }

      if (!formData.password) {
        toast.error("Please enter a password")
        return
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters")
        return
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }

      // Company validation
      if (!formData.companyName.trim()) {
        toast.error("Please enter your company name")
        return
      }

      if (!formData.companyEmail.trim()) {
        toast.error("Please enter your company email")
        return
      }

      // First create the company
      console.log('Creating company...')
      const companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.companyName,
        address: formData.companyAddress,
        phone: formData.companyPhone,
        email: formData.companyEmail,
        status: 'active',
        settings: {
          theme: 'system',
          notifications: {
            email: true,
            push: true,
          },
        },
      }

      const company = await createCompany(companyData)
      console.log('Company created successfully:', company)

      // Then create the user with company association
      console.log('Creating user account...')
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyId: company.id,
        role: 'admin', // First user is always admin
        status: 'active',
      })
      console.log('User account created successfully')

      toast.success("Registration successful! Redirecting to dashboard...")
      
      // Add a small delay before redirecting to ensure the toast is seen
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Registration error:", error)
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered")
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address")
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password is too weak")
      } else if (error.code === 'auth/network-request-failed') {
        toast.error("Network error. Please check your connection")
      } else if (error.message === "A company with this name already exists") {
        toast.error(error.message)
      } else {
        toast.error(error.message || "Failed to register. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Register</CardTitle>
          <CardDescription>
            Create an account for your real estate company
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="font-medium">Company Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="Acme Real Estate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="123 Business St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    name="companyPhone"
                    type="tel"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    placeholder="contact@acme.com"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating your account..." : "Register"}
            </Button>
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline"
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 