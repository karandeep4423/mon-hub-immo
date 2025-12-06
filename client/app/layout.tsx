import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { ProfileGuard } from '@/components/auth/ProfileGuard';
import { ToastContainer } from 'react-toastify';
import { SocketWrapper } from '@/components/chat/SocketWrapper';
import Header from '@/components/header/Header';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swrConfig';
import { RealtimeSyncProvider } from '@/providers/RealtimeSyncProvider';
import { CookieConsentProvider } from '@/context/CookieConsentContext';
import { CookieConsentBanner } from '@/components/gdpr/CookieConsentBanner';
import { CookiePreferencesModal } from '@/components/gdpr/CookiePreferencesModal';
import GoogleAnalytics from '@/components/gdpr/GoogleAnalytics';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'MonHubImmo - Plateforme Immobilière Collaborative',
	description:
		"Plateforme de collaboration entre agents immobiliers et apporteurs d'affaires pour optimiser vos transactions immobilières",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="fr">
			<body className={inter.className}>
				<ErrorBoundary>
					<SWRConfig value={swrConfig}>
						<AuthInitializer>
							<ProfileGuard>
								<CookieConsentProvider>
									<SocketWrapper>
										<RealtimeSyncProvider>
											<Header />
											{children}
											<CookieConsentBanner />
											<CookiePreferencesModal />
											<GoogleAnalytics />
										</RealtimeSyncProvider>
									</SocketWrapper>
									<ToastContainer
										position="top-right"
										autoClose={5000}
										hideProgressBar={false}
										newestOnTop={false}
										closeOnClick
										rtl={false}
										pauseOnFocusLoss
										draggable
										pauseOnHover
										theme="light"
									/>
								</CookieConsentProvider>
							</ProfileGuard>
						</AuthInitializer>
					</SWRConfig>
				</ErrorBoundary>
			</body>
		</html>
	);
}
