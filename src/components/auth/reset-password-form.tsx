'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        toast({ title: 'Reset failed', description: result.error, variant: 'destructive' });
        return;
      }

      toast({ title: 'Password reset!', description: 'You can now sign in with your new password.', variant: 'success' });
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-3">
          <h3 className="text-lg font-semibold">Invalid reset link</h3>
          <p className="text-sm text-muted-foreground">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password">
            <Button variant="outline" className="mt-4">Request a new link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('token')} />
          <FormField label="New Password" error={errors.password?.message} required hint="Min 8 chars, 1 uppercase, 1 number">
            <Input type="password" placeholder="Enter new password" {...register('password')} />
          </FormField>
          <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
            <Input type="password" placeholder="Confirm new password" {...register('confirmPassword')} />
          </FormField>
          <Button type="submit" className="w-full" loading={loading}>
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
