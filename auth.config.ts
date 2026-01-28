import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/portal/login",
    signOut: "/portal/login",
    error: "/portal/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnPortal = nextUrl.pathname.startsWith("/portal")
      const isOnPortalAuth = nextUrl.pathname.startsWith("/portal/login") ||
                             nextUrl.pathname.startsWith("/portal/register") ||
                             nextUrl.pathname.startsWith("/portal/error")

      if (isOnPortal && !isOnPortalAuth) {
        // Trying to access portal pages without login
        if (!isLoggedIn) {
          return Response.redirect(new URL("/portal/login", nextUrl))
        }
        return true
      } else if (isLoggedIn && isOnPortalAuth) {
        // Already logged in, trying to access login/register
        return Response.redirect(new URL("/portal", nextUrl))
      }
      return true
    },
  },
  providers: [], // Add providers with an empty array for Edge compatibility
} satisfies NextAuthConfig
