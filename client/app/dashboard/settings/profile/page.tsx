import type { Metadata } from 'next';
import { ProfileCompletion } from '@/components/auth/ProfileCompletion';

export const metadata: Metadata = {
	title: 'Modifier le profil - MonHubImmo',
	description: 'Modifiez votre profil agent',
};

export default function EditProfilePage() {
	return <ProfileCompletion editMode={true} />;
}
