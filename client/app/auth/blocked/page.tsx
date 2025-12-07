'use client';

import Link from 'next/link';
import { Ban, Mail, ArrowLeft } from 'lucide-react';

export default function BlockedPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
						<Ban className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-white">
						Compte suspendu
					</h1>
				</div>

				{/* Content */}
				<div className="px-6 py-8">
					<div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
						<p className="text-red-800 text-center">
							Votre compte a été temporairement suspendu par un
							administrateur.
						</p>
					</div>

					<p className="text-gray-600 mb-6 text-center">
						Pendant cette période, vous ne pouvez pas accéder à la
						plateforme. Si vous pensez qu&apos;il s&apos;agit
						d&apos;une erreur, veuillez contacter notre équipe
						support.
					</p>

					{/* Contact Support */}
					<div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
						<p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
							Besoin d&apos;aide ?
						</p>
						<a
							href="mailto:contact@monhubimmo.fr"
							className="inline-flex items-center gap-2 text-brand hover:text-brand/80 font-medium transition-colors"
						>
							<Mail className="w-4 h-4" />
							contact@monhubimmo.fr
						</a>
					</div>

					{/* Back to login */}
					<Link
						href="/auth/login"
						className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Retour à la connexion
					</Link>
				</div>

				{/* Footer */}
				<div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
					<p className="text-xs text-gray-500">
						© 2025 MonHubImmo. Tous droits réservés.
					</p>
				</div>
			</div>
		</div>
	);
}
