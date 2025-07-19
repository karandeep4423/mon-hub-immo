// app/auth/welcome/page.tsx
import type { Metadata } from 'next';
import { WelcomeContent } from '@/components/auth/WelcomeContent';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
  title: 'Welcome - HubImmo',
  description: 'Welcome to HubImmo',
};

export default function WelcomePage() {
  return (
    <AuthLayout title="Welcome to HubImmo!">
      <WelcomeContent />
    </AuthLayout>
  );
}
