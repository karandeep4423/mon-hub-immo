/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import React, { useState } from 'react';

export default function AdminSettingsPage() {
	const [settings, setSettings] = useState({
		platformName: 'MonHubImmo',
		maxUsersPerAgent: 10,
		commissionPercentage: 5,
		maintenanceMode: false,
		emailNotifications: true,
		smsNotifications: false,
	});

	const [saved, setSaved] = useState(false);

	const handleChange = (key: string, value: any) => {
		setSettings({ ...settings, [key]: value });
		setSaved(false);
	};

	const handleSave = async () => {
		try {
			// TODO: API call to save settings
			setSaved(true);
			setTimeout(() => setSaved(false), 3000);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<AdminLayout>
			<div className="space-y-8">
				{/* Header */}
				<div>
					<h1 className="text-4xl font-bold text-gray-900">Paramètres Admin</h1>
					<p className="text-gray-600 mt-1">Gérez les configurations de la plateforme</p>
				</div>

				{/* Settings Sections */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* General Settings */}
					<div className="lg:col-span-2 space-y-6">
						{/* Platform Settings */}
						<SettingSection title="Paramètres Généraux" icon="⚙️">
							<SettingField
								label="Nom de la plateforme"
								value={settings.platformName}
								onChange={(v) => handleChange('platformName', v)}
								type="text"
							/>
							<SettingField
								label="Max utilisateurs par agent"
								value={settings.maxUsersPerAgent}
								onChange={(v) => handleChange('maxUsersPerAgent', v)}
								type="number"
							/>
							<SettingField
								label="Commission (%) par défaut"
								value={settings.commissionPercentage}
								onChange={(v) => handleChange('commissionPercentage', v)}
								type="number"
							/>
						</SettingSection>

						{/* Notifications */}
						<SettingSection title="Notifications" icon="🔔">
							<ToggleSetting
								label="Notifications par email"
								enabled={settings.emailNotifications}
								onChange={(v) => handleChange('emailNotifications', v)}
							/>
							<ToggleSetting
								label="Notifications SMS"
								enabled={settings.smsNotifications}
								onChange={(v) => handleChange('smsNotifications', v)}
							/>
						</SettingSection>

						{/* System */}
						<SettingSection title="Système" icon="🛠️">
							<ToggleSetting
								label="Mode maintenance"
								enabled={settings.maintenanceMode}
								onChange={(v) => handleChange('maintenanceMode', v)}
								warning="La plateforme sera indisponible pour les utilisateurs"
							/>
						</SettingSection>

						{/* Save Button */}
						<div className="flex gap-3">
							<Button variant="primary" onClick={handleSave}>
								💾 Enregistrer les modifications
							</Button>
							<Button variant="outline">
								↺ Réinitialiser
							</Button>
						</div>

						{saved && (
							<div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
								✅ Paramètres enregistrés avec succès!
							</div>
						)}
					</div>

					{/* Right Sidebar */}
					<div className="space-y-6">
						{/* Quick Stats */}
						<div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
							<h3 className="font-bold text-gray-900 mb-4">📊 Statistiques</h3>
							<div className="space-y-3 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Serveur</span>
									<span className="font-semibold text-green-600">🟢 En ligne</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Base de données</span>
									<span className="font-semibold text-green-600">🟢 Connectée</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Email</span>
									<span className="font-semibold text-green-600">🟢 Actif</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Uptime</span>
									<span className="font-semibold text-blue-600">99.98%</span>
								</div>
							</div>
						</div>

						{/* Backup Info */}
						<div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
							<h3 className="font-bold text-gray-900 mb-4">🔒 Sauvegarde</h3>
							<div className="space-y-3 text-sm">
								<div>
									<p className="text-gray-600">Dernière sauvegarde</p>
										<p className="font-semibold text-gray-900">Aujourd&apos;hui 02:30</p>
								</div>
								<Button variant="secondary" size="sm" className="w-full">
									🔄 Lancer une sauvegarde
								</Button>
							</div>
						</div>

						{/* Help */}
						<div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
							<h3 className="font-bold text-blue-900 mb-2">❓ Besoin d&apos;aide?</h3>
							<p className="text-sm text-blue-700 mb-3">Consultez la documentation complète</p>
							<button className="text-sm text-blue-600 hover:text-blue-700 font-medium underline">
								Voir la documentation →
							</button>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
}

const SettingSection: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({
	title,
	icon,
	children,
}) => (
	<div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
		<h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
			<span className="text-2xl">{icon}</span> {title}
		</h2>
		<div className="space-y-4">{children}</div>
	</div>
);

const SettingField: React.FC<{
	label: string;
	value: any;
	onChange: (value: any) => void;
	type?: string;
}> = ({ label, value, onChange, type = 'text' }) => (
	<div>
		<label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
		<input
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
		/>
	</div>
);

const ToggleSetting: React.FC<{
	label: string;
	enabled: boolean;
	onChange: (value: boolean) => void;
	warning?: string;
}> = ({ label, enabled, onChange, warning }) => (
	<div>
		<div className="flex items-center justify-between">
			<label className="text-sm font-medium text-gray-700">{label}</label>
			<button
				onClick={() => onChange(!enabled)}
				className={`
					relative w-12 h-6 rounded-full transition-colors
					${enabled ? 'bg-green-500' : 'bg-gray-300'}
				`}
			>
				<div
					className={`
						absolute top-1 w-5 h-5 bg-white rounded-full transition-transform
						${enabled ? 'translate-x-6' : 'translate-x-1'}
					`}
				/>
			</button>
		</div>
		{warning && <p className="text-xs text-amber-600 mt-1">⚠️ {warning}</p>}
	</div>
);
