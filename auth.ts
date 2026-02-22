import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { USER_ROLE, STATUS } from "@/constants/portal/roles"
import { authConfig } from "@/auth.config"

// Type for PortalUser with status field (for TypeScript compatibility)
type PortalUserWithStatus = {
  id: string
  email: string
  name: string | null
  username: string
  image: string | null
  role: string
  status: string
  password: string | null
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
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
          username: user.username,
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
            // Auto-generate username from name: họ + tên (first word + last word)
            const nameParts = (user.name || user.email!.split('@')[0]).trim().split(/\s+/)
            const ho = nameParts[0]
            const ten = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ""
            const baseUsername = (ho + ten)
              .toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d").replace(/[^a-z0-9]/g, "")
            // Ensure uniqueness
            let username = baseUsername
            let suffix = 1
            while (await prisma.portalUser.findUnique({ where: { username } })) {
              username = `${baseUsername}${suffix}`
              suffix++
            }
            const newUser = await prisma.portalUser.create({
              data: {
                email: user.email!,
                name: user.name || user.email!.split('@')[0],
                username,
                image: user.image,
                emailVerified: new Date(),
                role: USER_ROLE.STUDENT as "STUDENT" | "TEACHER" | "SYSTEM_ADMIN", // Default role for new OAuth users
                status: STATUS.ACTIVE as "ACTIVE" | "INACTIVE" | "LOCKED",
              },
            }) as unknown as PortalUserWithStatus
            // Attach user data to the user object
            user.id = newUser.id
            user.role = newUser.role
            user.status = newUser.status
          } else {
            // Check if user is locked or pending
            if (existingUser.status === STATUS.LOCKED || existingUser.status === STATUS.INACTIVE) {
              return false // Prevent login for locked/inactive users
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

      // For credentials login, also check status
      if (account?.provider === "credentials") {
        try {
          const dbUser = await prisma.portalUser.findUnique({
            where: { email: user.email! },
          }) as PortalUserWithStatus | null

          if (dbUser && (dbUser.status === STATUS.LOCKED || dbUser.status === STATUS.INACTIVE)) {
            return false
          }
        } catch (error) {
          console.error("Error checking user status:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, trigger }) {
      // Initial sign in — populate token from user object
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
        token.name = user.name
        token.username = (user as Record<string, unknown>).username as string | undefined
        token.picture = user.image
        token.lastRefreshed = Date.now()
      }

      // Refresh user data from DB periodically (every 5 minutes) or on explicit update trigger
      const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
      const lastRefreshed = (token.lastRefreshed as number) || 0
      const shouldRefresh = trigger === "update" || (Date.now() - lastRefreshed > REFRESH_INTERVAL)

      if (shouldRefresh && token.email) {
        try {
          const dbUser = await prisma.portalUser.findUnique({
            where: { email: token.email },
          }) as PortalUserWithStatus | null
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.status = dbUser.status
            token.name = dbUser.name
            token.username = dbUser.username
            token.picture = dbUser.image
          }
          token.lastRefreshed = Date.now()
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
        session.user.username = token.username as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})
