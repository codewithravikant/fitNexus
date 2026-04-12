import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata = { title: 'Reset Password - FitNexus' };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" className="py-8" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
