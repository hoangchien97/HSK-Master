import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

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
        })

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
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // If signing in with Google OAuth
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.portalUser.findUnique({
            where: { email: user.email! },
          })

          // Create PortalUser if doesn't exist
          if (!existingUser) {
            const newUser = await prisma.portalUser.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                role: "STUDENT", // Default role
              },
            })
            // Attach user data to the user object
            user.id = newUser.id
            user.role = newUser.role
          } else {
            // Attach existing user data
            user.id = existingUser.id
            user.role = existingUser.role
          }
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      // Subsequent requests - get user from DB to keep data fresh
      if (token.email && !user) {
        try {
          const dbUser = await prisma.portalUser.findUnique({
            where: { email: token.email },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
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
