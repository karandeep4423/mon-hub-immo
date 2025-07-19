// app/page.tsx (Home page with user type selection)
import type { Metadata } from 'next';
import { UserTypeSelection } from '@/components/auth/UserTypeSelection';

export const metadata: Metadata = {
  title: 'HubImmo - Le 1er réseau social immobilier collaboratif',
  description: 'Choisissez votre accès à HubImmo',
};

export default function HomePage() {
  return <UserTypeSelection />;
}
