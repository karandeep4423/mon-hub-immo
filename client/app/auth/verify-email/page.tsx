import type { Metadata } from 'next';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Verify Email - HubImmo',
  description: 'Verify your email address',
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout title="Verify Your Email">
      <VerifyEmailForm />
    </AuthLayout>
  );
}
