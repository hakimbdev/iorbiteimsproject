import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/firebase"

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("__session")
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/reset-password", "/verify-email"]
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // If no auth cookie and trying to access protected route
  if (!authCookie && !isPublicPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // If has auth cookie and trying to access public route
  if (authCookie && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Check email verification for protected routes
  if (authCookie && !isPublicPath) {
    try {
      const decodedToken = await auth.verifySessionCookie(authCookie.value)
      
      // If email not verified and not on verification page, redirect to verification page
      if (!decodedToken.email_verified && pathname !== "/verify-email") {
        return NextResponse.redirect(new URL("/verify-email", request.url))
      }
    } catch (error) {
      // If session is invalid, clear cookie and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("__session")
      return response
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/settings/:path*",
    "/properties/:path*",
    "/clients/:path*",
    "/analytics/:path*",
    // Public routes
    "/login",
    "/register",
    "/reset-password",
    "/verify-email",
  ],
} 