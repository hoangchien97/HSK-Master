import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Get the pathname
  const pathname = nextUrl.pathname

  // Skip for public routes and non-portal routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/portal/login") ||
    pathname.startsWith("/portal/register") ||
    pathname.startsWith("/portal/error") ||
    pathname.startsWith("/portal/unauthorized") ||
    !pathname.startsWith("/portal")
  ) {
    return NextResponse.next()
  }

  // If not logged in and trying to access portal, redirect to login
  if (!isLoggedIn && pathname.startsWith("/portal")) {
    const loginUrl = new URL("/portal/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Allow the request - role checking will be done in page components
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$|.*\\.svg$).*)"],
}
