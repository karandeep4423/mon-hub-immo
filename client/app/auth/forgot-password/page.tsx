import type { Metadata } from 'next';
import {ForgotPasswordForm  } from '@/components/auth/ForgotPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Forgot Password - HubImmo',
  description: 'Forgot your password? Reset it here',
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot Password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
