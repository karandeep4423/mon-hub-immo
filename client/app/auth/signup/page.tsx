// app/auth/signup/page.tsx
import type { Metadata } from 'next';
import { RegistrationRequest } from '@/components/auth/RegistrationRequest';

export const metadata: Metadata = {
  title: 'Inscription - HubImmo',
  description: 'Demandez votre accès à HubImmo',
};

export default function SignupPage() {
  return <RegistrationRequest />;
}
