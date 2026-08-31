import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        identifier: {
          label: "Mobile Number or Email",
          type: "text",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (
          !credentials?.identifier ||
          !credentials?.password
        ) {
          throw new Error(
            "Mobile/email and password are required"
          );
        }

        await connectDB();

        const identifier =
          credentials.identifier.trim();

        const isEmail = identifier.includes("@");

        const query = isEmail
          ? {
              email: identifier.toLowerCase(),
            }
          : {
              mobile: identifier.replace(/\D/g, ""),
            };

        const user = await User.findOne(query).select(
          "+password"
        );

        if (!user) {
          throw new Error(
            "Invalid mobile/email or password"
          );
        }

        if (!user.isActive) {
          throw new Error(
            "Your account has been disabled"
          );
        }

        if (!user.password) {
          throw new Error(
            "Password authentication is not configured"
          );
        }

        const passwordValid =
          await bcrypt.compare(
            credentials.password,
            user.password
          );

        if (!passwordValid) {
          throw new Error(
            "Invalid mobile/email or password"
          );
        }

        // Update login time
        user.lastLogin = new Date();

        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email || null,
          mobile: user.mobile || null,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.mobile = user.mobile;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.isActive = user.isActive;
      }

      return token;
    },

    async session({ session, token }) {
      if (!token?.id) {
        return session;
      }

      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        mobile: token.mobile,
        role: token.role,
        isVerified: token.isVerified,
        isActive: token.isActive,
      };

      return session;
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export {
  handler as GET,
  handler as POST,
};