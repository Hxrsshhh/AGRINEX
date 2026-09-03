import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import connectDB from "@/lib/db";
import Farmer from "@/models/Farmer";
import Officer from "@/models/Officer";
import Admin from "@/models/Admin";

const USER_FIELDS = [
  "id", "name", "email", "mobile", "role", "isPhoneVerified",
  "isVerified", "isActive", "onboardingCompleted", "onboardingSkipped",
  "designation", "officerCentre", "adminLevel",
];

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Mobile Number or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Mobile/email and password are required");
        }

        await connectDB();
        const id = credentials.identifier.trim();
        const query = id.includes("@")
          ? { email: id.toLowerCase() }
          : { mobile: id.replace(/\D/g, "") };

        const models = [
          { model: Farmer, role: "FARMER" },
          { model: Officer, role: "OFFICER" },
          { model: Admin, role: "ADMIN" },
        ];

        let account = null;
        let accountType = null;

        for (const { model, role } of models) {
          account = await model.findOne(query).select("+password");
          if (account) {
            accountType = role;
            break;
          }
        }

        if (!account) throw new Error("Invalid mobile/email or password");
        if (!account.isActive) throw new Error("Your account has been disabled");
        if (!account.password) throw new Error("Password authentication is not configured");

        const isValid = await bcrypt.compare(credentials.password, account.password);
        if (!isValid) throw new Error("Invalid mobile/email or password");

        account.lastLogin = new Date();
        await account.save();

        return {
          id: account._id.toString(),
          name: account.name,
          email: account.email || null,
          mobile: account.mobile || null,
          role: accountType,
          isPhoneVerified: account.isPhoneVerified ?? false,
          isVerified: account.verification?.isVerified ?? false,
          isActive: account.isActive,
          onboardingCompleted: account.onboardingCompleted === true,
          onboardingSkipped: account.onboardingSkipped === true,
          designation: account.designation || null,
          officerCentre: account.officerCentre?.toString() || null,
          adminLevel: account.adminLevel || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        USER_FIELDS.forEach((key) => { token[key] = user[key]; });
        token.sessionId = randomUUID();
      }
      return token;
    },
    async session({ session, token }) {
      if (!token?.id) return session;
      session.user = { sessionId: token.sessionId };
      USER_FIELDS.forEach((key) => { session.user[key] = token[key]; });
      return session;
    },
  },
  pages: { signIn: "/signin", error: "/signin" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };