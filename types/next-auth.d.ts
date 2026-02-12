import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      status: string
      username?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    status?: string
    username?: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: string
    status: string
    username?: string
  }
}
