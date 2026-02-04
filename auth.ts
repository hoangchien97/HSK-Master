import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { ROLES } from "@/lib/constants/roles"

// Type for PortalUser with status field (for TypeScript compatibility)
type PortalUserWithStatus = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  status: string
  password: string | null
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data

        // Find user by email
        const user = await prisma.portalUser.findUnique({
          where: { email },
        }) as PortalUserWithStatus | null

        if (!user || !user.password) {
          return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // If signing in with Google OAuth
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.portalUser.findUnique({
            where: { email: user.email! },
          }) as PortalUserWithStatus | null

          // Create PortalUser if doesn't exist
          if (!existingUser) {
            const newUser = await prisma.portalUser.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                role: ROLES.STUDENT as "STUDENT" | "TEACHER" | "SYSTEM_ADMIN", // Default role for new OAuth users
                status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "LOCKED",
              },
            }) as unknown as PortalUserWithStatus
            // Attach user data to the user object
            user.id = newUser.id
            user.role = newUser.role
            user.status = newUser.status
          } else {
            // Check if user is locked
            if (existingUser.status === "LOCKED") {
              return false // Prevent login for locked users
            }
            // Attach existing user data
            user.id = existingUser.id
            user.role = existingUser.role
            user.status = existingUser.status
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
      }
      // Always fetch fresh data from DB to keep name and image updated
      if (token.email) {
        try {
          const dbUser = await prisma.portalUser.findUnique({
            where: { email: token.email },
          }) as PortalUserWithStatus | null
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.status = dbUser.status
            token.name = dbUser.name
            token.picture = dbUser.image
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
})
