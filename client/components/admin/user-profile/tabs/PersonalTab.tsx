'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/CustomSelect';
import { User, Mail, Phone, BadgeCheck } from 'lucide-react';
import { USER_ROLE_OPTIONS } from '@/lib/constants/admin';
import { UserProfile } from '../types';
import { FormField, TabSectionHeader } from '../FormComponents';

interface PersonalTabProps {
	form: UserProfile;
	handleChange: (field: keyof UserProfile, value: string | boolean) => void;
}

export function PersonalTab({ form, handleChange }: PersonalTabProps) {
	return (
		<Card className="shadow-lg border-0 ring-1 ring-gray-100">
			<div className="p-6">
				<TabSectionHeader
					icon={User}
					title="Informations personnelles"
					description="Identité et coordonnées de l'utilisateur"
					iconBgColor="bg-blue-50"
					iconColor="text-blue-600"
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<FormField label="Prénom" icon={<User size={16} />}>
						<Input
							value={form.firstName || ''}
							onChange={(e) =>
								handleChange('firstName', e.target.value)
							}
							placeholder="Prénom"
							className="bg-gray-50/50 focus:bg-white transition-colors"
						/>
					</FormField>

					<FormField label="Nom" icon={<User size={16} />}>
						<Input
							value={form.lastName || ''}
							onChange={(e) =>
								handleChange('lastName', e.target.value)
							}
							placeholder="Nom"
							className="bg-gray-50/50 focus:bg-white transition-colors"
						/>
					</FormField>

					<FormField label="Email" icon={<Mail size={16} />}>
						<Input
							type="email"
							value={form.email || ''}
							onChange={(e) =>
								handleChange('email', e.target.value)
							}
							placeholder="Email"
							className="bg-gray-50/50 focus:bg-white transition-colors"
						/>
					</FormField>

					<FormField label="Téléphone" icon={<Phone size={16} />}>
						<Input
							value={form.phone || ''}
							onChange={(e) =>
								handleChange('phone', e.target.value)
							}
							placeholder="Téléphone"
							className="bg-gray-50/50 focus:bg-white transition-colors"
						/>
					</FormField>

					<FormField label="Rôle" icon={<BadgeCheck size={16} />}>
						<Select
							value={form.type || form.userType || 'apporteur'}
							onChange={(val) => handleChange('type', val)}
							options={USER_ROLE_OPTIONS}
						/>
					</FormField>
				</div>
			</div>
		</Card>
	);
}
