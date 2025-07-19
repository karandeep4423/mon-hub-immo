import type { Metadata } from 'next';
import { ProfileCompletion } from '@/components/auth/ProfileCompletion';

export const metadata: Metadata = {
  title: 'Création du profil - HubImmo',
  description: 'Complétez votre profil agent',
};

export default function CompleteProfilePage() {
  return <ProfileCompletion />;
}
