'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ConsentStatus = 'granted' | 'denied' | 'pending';

export interface CookieConsent {
	necessary: boolean;
	analytics: boolean;
	marketing: boolean;
	preferences: boolean;
	timestamp?: string;
}

interface CookieConsentContextType {
	consent: CookieConsent;
	status: ConsentStatus;
	showBanner: boolean;
	showPreferences: boolean;
	acceptAll: () => void;
	rejectAll: () => void;
	savePreferences: (consent: CookieConsent) => void;
	openPreferences: () => void;
	closePreferences: () => void;
	resetConsent: () => void;
}

const defaultConsent: CookieConsent = {
	necessary: true, // Always true
	analytics: false,
	marketing: false,
	preferences: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(
	undefined,
);

export const useCookieConsent = () => {
	const context = useContext(CookieConsentContext);
	if (!context) {
		throw new Error(
			'useCookieConsent must be used within a CookieConsentProvider',
		);
	}
	return context;
};

export const CookieConsentProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
	const [status, setStatus] = useState<ConsentStatus>('pending');
	const [showBanner, setShowBanner] = useState(false);
	const [showPreferences, setShowPreferences] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Load consent from localStorage on mount
		const storedConsent = localStorage.getItem('cookie_consent');
		if (storedConsent) {
			try {
				const parsed = JSON.parse(storedConsent);
				setConsent(parsed);
				setStatus('granted'); // Assume granted if exists, or check specific logic
				setShowBanner(false);
			} catch (e) {
				console.error('Failed to parse cookie consent', e);
				setShowBanner(true);
			}
		} else {
			setShowBanner(true);
		}
		setIsInitialized(true);
	}, []);

	const saveToStorage = (newConsent: CookieConsent) => {
		const consentWithTimestamp = {
			...newConsent,
			timestamp: new Date().toISOString(),
		};
		localStorage.setItem(
			'cookie_consent',
			JSON.stringify(consentWithTimestamp),
		);
		setConsent(consentWithTimestamp);
		setStatus('granted');
		setShowBanner(false);
		setShowPreferences(false);
	};

	const acceptAll = () => {
		saveToStorage({
			necessary: true,
			analytics: true,
			marketing: true,
			preferences: true,
		});
	};

	const rejectAll = () => {
		saveToStorage({
			necessary: true,
			analytics: false,
			marketing: false,
			preferences: false,
		});
	};

	const savePreferences = (newConsent: CookieConsent) => {
		saveToStorage({
			...newConsent,
			necessary: true, // Ensure necessary is always true
		});
	};

	const resetConsent = () => {
		localStorage.removeItem('cookie_consent');
		setConsent(defaultConsent);
		setStatus('pending');
		setShowBanner(true);
	};

	const openPreferences = () => setShowPreferences(true);
	const closePreferences = () => setShowPreferences(false);

	if (!isInitialized) {
		return null; // Or a loading spinner if needed, but null avoids flash
	}

	return (
		<CookieConsentContext.Provider
			value={{
				consent,
				status,
				showBanner,
				showPreferences,
				acceptAll,
				rejectAll,
				savePreferences,
				openPreferences,
				closePreferences,
				resetConsent,
			}}
		>
			{children}
		</CookieConsentContext.Provider>
	);
};
