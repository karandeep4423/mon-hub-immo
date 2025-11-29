'use client';

import React from 'react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import Link from 'next/link';

export const CookieConsentBanner = () => {
	const { showBanner, acceptAll, rejectAll, openPreferences } =
		useCookieConsent();

	if (!showBanner) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
			<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<div className="flex-1 text-sm text-gray-600">
					<p className="mb-2">
						Nous utilisons des cookies pour améliorer votre expérience,
						analyser le trafic et personnaliser les publicités.
					</p>
					<p>
						En cliquant sur « Tout accepter », vous consentez à
						l&apos;utilisation de tous les cookies. Vous pouvez
						modifier vos préférences à tout moment.
						<Link
							href="/politique-cookies"
							className="text-brand-600 hover:underline ml-1"
						>
							En savoir plus
						</Link>
					</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
					<button
						onClick={openPreferences}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
					>
						Personnaliser
					</button>
					<button
						onClick={rejectAll}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
					>
						Tout refuser
					</button>
					<button
						onClick={acceptAll}
						className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors whitespace-nowrap"
					>
						Tout accepter
					</button>
				</div>
			</div>
		</div>
	);
};
