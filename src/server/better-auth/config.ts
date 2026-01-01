import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "~/lib/mail";

import { db } from "~/server/db";
import { schema } from "~/server/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    async sendResetPassword(data) {
      await sendPasswordResetEmail({
        email: data.user.email,
        name: data.user.name,
        url: data.url,
      });
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    async sendVerificationEmail(data) {
      await sendEmailVerificationEmail({
        email: data.user.email,
        name: data.user.name,
        url: data.url,
      });
    },

    async afterEmailVerification(user) {
      await sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
    },
  },

  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  trustedOrigins: ["http://localhost:3000"],
  advanced: {
    database: {
      generateId: false,
    },
  },
} satisfies BetterAuthOptions);

export type Session = typeof auth.$Infer.Session;
