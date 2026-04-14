import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { CredentialsSignin } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-helpers';
import { verifyTOTP } from '@/lib/two-factor';
import { oauthEnv } from '@/lib/oauth-config';

const githubId = oauthEnv('GITHUB_CLIENT_ID');
const githubSecret = oauthEnv('GITHUB_CLIENT_SECRET');
const googleId = oauthEnv('GOOGLE_CLIENT_ID');
const googleSecret = oauthEnv('GOOGLE_CLIENT_SECRET');

const providers = [
  ...(githubId && githubSecret
    ? [
        GitHub({
          clientId: githubId,
          clientSecret: githubSecret,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  ...(googleId && googleSecret
    ? [
        Google({
          clientId: googleId,
          clientSecret: googleSecret,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
      twoFactorCode: { label: '2FA Code', type: 'text' },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      const twoFactorCode = credentials?.twoFactorCode as string | undefined;
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.password) {
        const err = new CredentialsSignin();
        err.code = 'oauth_only';
        throw err;
      }

      const ok = await verifyPassword(password, user.password);
      if (!ok) return null;

      if (!user.emailVerified) {
        const err = new CredentialsSignin();
        err.code = 'email_not_verified';
        throw err;
      }

      if (user.twoFactorEnabled) {
        if (!twoFactorCode || twoFactorCode.length !== 6) {
          const err = new CredentialsSignin();
          err.code = 'invalid_2fa';
          throw err;
        }
        if (!(await verifyTOTP(twoFactorCode, user.twoFactorSecret!))) {
          const err = new CredentialsSignin();
          err.code = 'invalid_2fa';
          throw err;
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider && account.provider !== 'credentials' && user?.id) {
        const u = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true },
        });
        if (!u?.emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        const hp = await prisma.healthProfile.findUnique({
          where: { userId: user.id },
          select: { onboardingCompleted: true },
        });
        token.hasProfile = !!hp?.onboardingCompleted;
      } else if (token.id) {
        const hp = await prisma.healthProfile.findUnique({
          where: { userId: token.id as string },
          select: { onboardingCompleted: true },
        });
        token.hasProfile = !!hp?.onboardingCompleted;
      }

      if (trigger === 'update' && session && typeof session === 'object') {
        const upd = session as { name?: string | null };
        if (upd.name !== undefined) {
          token.name = upd.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.hasProfile = token.hasProfile as boolean;
        if (token.name !== undefined) {
          session.user.name = token.name;
        }
        if (token.email) {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
});
