import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } =
  NextAuth({
    adapter: PrismaAdapter(prisma),

    session: {
      strategy: "jwt",
    },

    providers: [
      Credentials({
        credentials: {
          email: {
            label: "Email",
            type: "email",
          },
          password: {
            label: "Password",
            type: "password",
          },
        },

        async authorize(credentials) {
          if (
            !credentials?.email ||
            !credentials?.password
          ) {
            return null;
          }

          const email = String(
            credentials.email
          )
            .trim()
            .toLowerCase();

          const password = String(
            credentials.password
          );

          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user?.passwordHash) {
            return null;
          }

          const passwordMatches =
            await bcrypt.compare(
              password,
              user.passwordHash
            );

          if (!passwordMatches) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }),
    ],

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.userId = user.id;
        }

        return token;
      },

      async session({ session, token }) {
        if (session.user && token.userId) {
          session.user.id = token.userId as string;
        }

        return session;
      },
    },

    pages: {
      signIn: "/login",
    },
  });