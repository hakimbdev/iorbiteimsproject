import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, setDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore"
import type { User, Company } from "@/types"

export async function POST(request: Request) {
  try {
    const { name, email, password, companyName } = await request.json()

    // Validate input
    if (!name || !email || !password || !companyName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Check if company name already exists
    const companiesRef = collection(db, "companies")
    const q = query(companiesRef, where("name", "==", companyName))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return NextResponse.json(
        { error: "Company name already exists" },
        { status: 400 }
      )
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    // Send email verification
    await sendEmailVerification(userCredential.user)

    // Create company document
    const companyRef = await addDoc(collection(db, "companies"), {
      name: companyName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Omit<Company, 'id'>)

    // Create user document
    const userData: Omit<User, 'id'> = {
      name,
      email,
      companyId: companyRef.id,
      role: "admin",
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await setDoc(doc(db, "users", userCredential.user.uid), userData)

    return NextResponse.json(
      { 
        message: "Registration successful",
        userId: userCredential.user.uid,
        companyId: companyRef.id,
        email: userCredential.user.email
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    
    // Handle specific Firebase errors
    let errorMessage = "Registration failed"
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email is already registered"
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address"
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak"
    } else if (error.code === "auth/network-request-failed") {
      errorMessage = "Network error. Please check your connection"
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

