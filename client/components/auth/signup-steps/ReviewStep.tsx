import { SignUpFormData } from '@/lib/validation';

interface ReviewStepProps {
	formData: SignUpFormData;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="text-center mb-4 sm:mb-6">
				<h2 className="text-lg sm:text-xl font-semibold text-gray-800">
					Vérifiez vos informations
				</h2>
				<p className="text-xs sm:text-sm text-gray-500 mt-1">
					Confirmez avant de créer votre compte
				</p>
			</div>

			<div className="space-y-3 sm:space-y-4">
				<div className="bg-gray-50 rounded-lg p-3 sm:p-4">
					<h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
						Informations personnelles
					</h3>
					<div className="space-y-2 text-xs sm:text-sm">
						<p>
							<span className="text-gray-600">Nom:</span>{' '}
							<span className="font-medium">
								{formData.firstName} {formData.lastName}
							</span>
						</p>
						<p>
							<span className="text-gray-600">Email:</span>{' '}
							<span className="font-medium break-all">
								{formData.email}
							</span>
						</p>
						<p>
							<span className="text-gray-600">Téléphone:</span>{' '}
							<span className="font-medium">
								{formData.phone}
							</span>
						</p>
					</div>
				</div>

				<div className="bg-gray-50 rounded-lg p-3 sm:p-4">
					<h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
						Rôle
					</h3>
					<p className="text-xs sm:text-sm">
						<span className="inline-flex items-center px-2.5 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-brand text-white">
							{formData.userType === 'agent'
								? 'Agent immobilier'
								: 'Apporteur'}
						</span>
					</p>
				</div>

				{formData.userType === 'agent' && formData.agentType && (
					<div className="bg-gray-50 rounded-lg p-3 sm:p-4">
						<h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
							Informations professionnelles
						</h3>
						<p className="text-xs sm:text-sm text-gray-600 mb-2">
							Type:{' '}
							<span className="font-medium text-gray-900">
								{formData.agentType === 'independent'
									? 'Indépendant'
									: formData.agentType === 'commercial'
										? 'Commercial'
										: 'Employé'}
							</span>
						</p>
						{formData.tCard && (
							<p className="text-xs sm:text-sm text-gray-600">
								Carte T:{' '}
								<span className="font-medium text-gray-900">
									{formData.tCard}
								</span>
							</p>
						)}
						{formData.sirenNumber && (
							<p className="text-xs sm:text-sm text-gray-600">
								SIREN:{' '}
								<span className="font-medium text-gray-900">
									{formData.sirenNumber}
								</span>
							</p>
						)}
						{formData.rsacNumber && (
							<p className="text-xs sm:text-sm text-gray-600">
								RSAC:{' '}
								<span className="font-medium text-gray-900">
									{formData.rsacNumber}
								</span>
							</p>
						)}
						{formData.collaboratorCertificate && (
							<p className="text-xs sm:text-sm text-gray-600">
								Certificat:{' '}
								<span className="font-medium text-gray-900">
									{formData.collaboratorCertificate}
								</span>
							</p>
						)}
					</div>
				)}
			</div>

			<div className="text-xs text-gray-500 text-center px-4">
				En créant un compte, vous acceptez nos conditions
				d&apos;utilisation
			</div>
		</div>
	);
};
