import type { Metadata } from 'next';
import { LoginWithUserType } from '@/components/auth/LoginWithUserType';
 
export const metadata: Metadata = {
  title: 'Connexion - HubImmo',
  description: 'Connectez-vous à votre compte HubImmo',
};

export default function LoginPage() {
  return (
    <>
      <LoginWithUserType />
    </>
  );
}