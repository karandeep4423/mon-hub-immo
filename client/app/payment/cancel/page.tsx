'use client';

import { FiX, FiArrowLeft, FiHelpCircle, FiCreditCard } from 'react-icons/fi';
import Link from 'next/link';

export default function PaymentCancelPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<div className="bg-red-400 relative overflow-hidden">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
					{/* Cancel Icon */}
					<div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
						<div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
							<FiX className="w-8 h-8 text-gray-500" />
						</div>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
						Paiement annulé
					</h1>
					<p className="text-lg text-gray-600">
						Aucun montant n&apos;a été débité de votre compte
					</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 mt-2 pb-16">
				<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
					{/* Info box */}
					<div className="px-8 pt-8 pb-6">
						<div className="bg-brand-50 rounded-xl p-5">
							<div className="flex items-start gap-3">
								<div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
									<FiHelpCircle className="w-5 h-5 text-brand" />
								</div>
								<div>
									<h3 className="font-semibold text-brand-dark mb-1">
										Besoin d&apos;aide ?
									</h3>
									<p className="text-sm text-gray-600">
										Si vous avez rencontré un problème lors
										du paiement ou si vous avez des
										questions sur notre abonnement,
										n&apos;hésitez pas à nous contacter.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="px-8 pb-8 space-y-3">
						<Link
							href="/payment"
							className="flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand-dark text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-brand hover:shadow-brand-lg"
						>
							<FiCreditCard className="w-5 h-5" />
							<span>Réessayer le paiement</span>
						</Link>

						<Link
							href="/dashboard"
							className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
						>
							<FiArrowLeft className="w-5 h-5" />
							<span>Retour à l&apos;accueil</span>
						</Link>
					</div>

					{/* Help text */}
					<div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
						<p className="text-xs text-gray-500 text-center">
							Vous pouvez réessayer à tout moment ou nous
							contacter si vous avez des questions.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
