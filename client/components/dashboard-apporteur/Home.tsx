import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';

const Home = () => {
	const { logout } = useAuth();
	const handleLogout = () => {
		logout();
	};

	return (
		<div>
			<h1 className="text-2xl font-bold text-center mt-10">
				Welcome to the Dashboard Apporteur
			</h1>
			<p className="text-center mt-4">
				This is the home page of your dashboard. You can navigate to
				different sections from here.
			</p>
			<Button
				variant="outline"
				size="sm"
				onClick={handleLogout}
				className="text-gray-700 border-gray-300 hover:bg-gray-50"
			>
				<svg
					className="w-4 h-4 mr-2"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
					/>
				</svg>
				Déconnexion
			</Button>
			{/* Add more content or components as needed */}
		</div>
	);
};

export default Home;
