// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { ToastContainer } from 'react-toastify';
import { SocketWrapper } from '@/components/chat/SocketWrapper';
import Header from '@/components/header/Header';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swrConfig';
import { RealtimeSyncProvider } from '@/providers/RealtimeSyncProvider';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'HubImmo - Real Estate Platform',
	description: 'Your trusted real estate platform',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ErrorBoundary>
					<SWRConfig value={swrConfig}>
						<AuthInitializer>
							<SocketWrapper>
								<RealtimeSyncProvider>
									<Header />
									{children}
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
						</AuthInitializer>
					</SWRConfig>
				</ErrorBoundary>
			</body>
		</html>
	);
}
