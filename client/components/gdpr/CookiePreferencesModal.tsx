'use client';

import React, { useState, useEffect } from 'react';
import { useCookieConsent, CookieConsent } from '@/context/CookieConsentContext';
import { Modal } from '@/components/ui/Modal';

export const CookiePreferencesModal = () => {
	const { showPreferences, closePreferences, savePreferences, consent } =
		useCookieConsent();
	const [localConsent, setLocalConsent] = useState<CookieConsent>(consent);

	// Sync local state when modal opens
	useEffect(() => {
		if (showPreferences) {
			setLocalConsent(consent);
		}
	}, [showPreferences, consent]);

	const handleToggle = (key: keyof CookieConsent) => {
		if (key === 'necessary') return; // Cannot toggle necessary
		setLocalConsent((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleSave = () => {
		savePreferences(localConsent);
	};

	return (
		<Modal
			isOpen={showPreferences}
			onClose={closePreferences}
			title="Préférences des cookies"
			size="lg"
			zIndex={60}
		>
			<div className="space-y-6">
				<p className="text-sm text-gray-500">
					Gérez vos préférences de consentement pour les cookies. Les
					cookies nécessaires sont indispensables au fonctionnement du
					site.
				</p>

				{/* Necessary */}
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<label className="text-base font-medium text-gray-900">
							Nécessaires (Toujours actif)
						</label>
						<p className="text-sm text-gray-500">
							Ces cookies sont indispensables au fonctionnement du
							site web.
						</p>
					</div>
					<div className="ml-4 flex h-6 items-center">
						<input
							type="checkbox"
							checked={true}
							disabled
							className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 opacity-50 cursor-not-allowed"
						/>
					</div>
				</div>

				{/* Analytics */}
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<label
							htmlFor="analytics"
							className="text-base font-medium text-gray-900 cursor-pointer"
						>
							Analytiques
						</label>
						<p className="text-sm text-gray-500">
							Nous permettent de mesurer l&apos;audience et
							d&apos;analyser comment les visiteurs utilisent le
							site.
						</p>
					</div>
					<div className="ml-4 flex h-6 items-center">
						<input
							id="analytics"
							type="checkbox"
							checked={localConsent.analytics}
							onChange={() => handleToggle('analytics')}
							className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 cursor-pointer"
						/>
					</div>
				</div>

				{/* Marketing */}
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<label
							htmlFor="marketing"
							className="text-base font-medium text-gray-900 cursor-pointer"
						>
							Marketing
						</label>
						<p className="text-sm text-gray-500">
							Utilisés pour afficher des publicités pertinentes et
							mesurer l&apos;efficacité de nos campagnes.
						</p>
					</div>
					<div className="ml-4 flex h-6 items-center">
						<input
							id="marketing"
							type="checkbox"
							checked={localConsent.marketing}
							onChange={() => handleToggle('marketing')}
							className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-600 cursor-pointer"
						/>
					</div>
				</div>

				<div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
					<button
						type="button"
						onClick={handleSave}
						className="inline-flex w-full justify-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 sm:w-auto"
					>
						Enregistrer mes choix
					</button>
					<button
						type="button"
						onClick={closePreferences}
						className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
					>
						Annuler
					</button>
				</div>
			</div>
		</Modal>
	);
};
