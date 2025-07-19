import type { Metadata } from 'next';
import { LoginWithUserType } from '@/components/auth/LoginWithUserType';
import Header from './components/Header';

export const metadata: Metadata = {
  title: 'Connexion - HubImmo',
  description: 'Connectez-vous à votre compte HubImmo',
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <LoginWithUserType />
    </>
  );
}