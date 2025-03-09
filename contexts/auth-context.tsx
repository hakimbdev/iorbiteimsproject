"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User as FirebaseUser } from "firebase/auth"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { trackActivity, trackLoginAttempt, trackRegistration } from "@/lib/activity"
import type { User } from "@/types"
import type { ActivityType } from "@/types/activity"
import { toast } from "sonner"

interface AuthContextType {
  user: FirebaseUser | null
  userData: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
  sendVerificationEmail: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      
      if (user) {
        try {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            setUserData(userDoc.data() as User)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Error loading user data")
        }
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // Track successful login
      await Promise.all([
        trackLoginAttempt(result.user.uid, email, true, "email"),
        trackActivity(result.user.uid, "login", { success: true })
      ])

      const userDoc = await getDoc(doc(db, "users", result.user.uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data() as User)
      }

      toast.success("Signed in successfully")
    } catch (error: any) {
      console.error("Sign in error:", error)
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error("Invalid email or password")
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many failed attempts. Please try again later")
      } else {
        toast.error(error.message || "Failed to sign in")
      }
      
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", result.user.uid))
      
      if (!userDoc.exists()) {
        // Create new user document
        const newUser: Omit<User, 'companyId'> = {
          id: result.user.uid,
          email: result.user.email!,
          firstName: result.user.displayName?.split(" ")[0] || "",
          lastName: result.user.displayName?.split(" ").slice(1).join(" ") || "",
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "active",
          role: "viewer",
        }

        await setDoc(doc(db, "users", result.user.uid), newUser)
        setUserData(newUser as User)

        // Track registration
        await trackRegistration(result.user.uid, result.user.email!, true)
        toast.success("Account created successfully")
      } else {
        setUserData(userDoc.data() as User)
      }

      // Track successful login
      await Promise.all([
        trackLoginAttempt(result.user.uid, result.user.email!, true, "google"),
        trackActivity(result.user.uid, "google_login", { success: true })
      ])

      toast.success("Signed in successfully")
    } catch (error: any) {
      console.error("Google sign in error:", error)
      toast.error(error.message || "Failed to sign in with Google")
      throw error
    }
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document
      const newUser: User = {
        id: result.user.uid,
        email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        companyId: userData.companyId || "",
        role: userData.role || "viewer",
        status: userData.status || "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, "users", result.user.uid), newUser)
      setUserData(newUser)

      // Track successful registration
      await Promise.all([
        trackRegistration(result.user.uid, email, true),
        trackActivity(result.user.uid, "registration", { success: true })
      ])

      // Update profile and send verification email
      if (userData.firstName && userData.lastName) {
        await updateProfile(result.user, {
          displayName: `${userData.firstName} ${userData.lastName}`,
        })
      }
      
      await sendEmailVerification(result.user)
      await trackActivity(result.user.uid, "email_verification", { success: true })
      
      toast.success("Account created successfully")
    } catch (error: any) {
      console.error("Sign up error:", error)
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered")
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address")
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password must be at least 6 characters")
      } else {
        toast.error(error.message || "Failed to create account")
      }
      
      throw error
    }
  }

  const logout = async () => {
    try {
      const userId = auth.currentUser?.uid
      if (userId) {
        await trackActivity(userId, "logout", { success: true })
      }
      await signOut(auth)
      setUserData(null)
      toast.success("Signed out successfully")
    } catch (error: any) {
      console.error("Sign out error:", error)
      toast.error(error.message || "Failed to sign out")
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent")
    } catch (error: any) {
      console.error("Reset password error:", error)
      
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email")
      } else {
        toast.error(error.message || "Failed to send reset email")
      }
      
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No user logged in")

    try {
      const userRef = doc(db, "users", user.uid)
      await setDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      }, { merge: true })

      // Update display name if first name or last name changed
      if (data.firstName || data.lastName) {
        const currentData = (await getDoc(userRef)).data() as User
        await updateProfile(user, {
          displayName: `${data.firstName || currentData.firstName} ${data.lastName || currentData.lastName}`,
        })
      }

      // Refresh user data
      const updatedDoc = await getDoc(userRef)
      setUserData(updatedDoc.data() as User)

      await trackActivity(user.uid, "profile_update", { success: true })
      toast.success("Profile updated successfully")
    } catch (error: any) {
      await trackActivity(user.uid, "profile_update", { success: false, error: error.message })
      toast.error(error.message || "Failed to update profile")
      throw error
    }
  }

  const sendVerificationEmail = async () => {
    if (!user) throw new Error("No user logged in")
    
    try {
      await sendEmailVerification(user)
      await trackActivity(user.uid, "email_verification", { success: true })
      toast.success("Verification email sent")
    } catch (error: any) {
      console.error("Send verification email error:", error)
      toast.error(error.message || "Failed to send verification email")
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signIn,
      signInWithGoogle,
      signUp,
      logout,
      resetPassword,
      updateUserProfile,
      sendVerificationEmail,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 