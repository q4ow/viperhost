// Extend NextAuth session type to include user id
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user?: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }
}
