import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AuthLayout } from '@/components/auth/auth-layout';

export default async function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user) {
    redirect('/home');
  }

  return <AuthLayout>{children}</AuthLayout>;
}
