// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastContainer } from 'react-toastify';
import { SocketWrapper } from '@/components/chat/SocketWrapper';
import Header from '@/components/header/Header';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
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
					<Header />
					<AuthProvider>
						<SocketWrapper>{children}</SocketWrapper>
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
					</AuthProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}
