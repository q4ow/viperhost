import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import { generateUUID } from "@/lib/utils";

export interface ExtendedSession extends Session {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface ExtendedUser extends User {
  uuid?: string;
  password?: string;
}

interface AuthorizeCredentials {
  email: string;
  password: string;
}

interface SessionCallback {
  session: Session;
  token: JWT;
}

interface JWTCallback {
  token: JWT;
  user?: ExtendedUser;
}

interface OAuthAccount {
  provider: string;
  type: string;
  providerAccountId: string;
  access_token?: string;
  expires_at?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  userId: string;
}

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(db),
    createUser: async (data: Omit<AdapterUser, "id">): Promise<AdapterUser> => {
      const user = await db.user.create({
        data: {
          ...data,
          email: data.email ? data.email.toLowerCase() : "",
          uuid: await generateUUID(),
        },
      });
      return user as AdapterUser;
    },
    linkAccount: async (account: OAuthAccount) => {
      const { refresh_token_expires_in, ...accountData } = account;
      await db.account.create({
        data: accountData,
      });
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: AuthorizeCredentials | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.toLowerCase();

        const user = await db.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: JWTCallback) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: SessionCallback): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          id: token.id as string,
          name: session.user?.name ?? null,
          email: session.user?.email ?? null,
          image: session.user?.image ?? null,
        },
      };
    },
  },
};
