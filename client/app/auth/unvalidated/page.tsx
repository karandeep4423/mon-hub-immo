'use client';

import Link from 'next/link';
import { Clock, Mail, ArrowLeft } from 'lucide-react';

export default function UnvalidatedPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-8 text-center">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
						<Clock className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-2xl font-bold text-white">
						Compte en attente de validation
					</h1>
				</div>

				{/* Content */}
				<div className="px-6 py-8">
					<div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
						<p className="text-amber-800 text-center">
							Votre compte n&apos;a pas encore été validé par un
							administrateur.
						</p>
					</div>

					<p className="text-gray-600 mb-6 text-center">
						Votre demande d&apos;inscription est en cours
						d&apos;examen. Vous recevrez un email de confirmation
						dès que votre compte sera activé. Merci de votre
						patience !
					</p>

					{/* Contact Support */}
					<div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
						<p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
							Questions ?
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
