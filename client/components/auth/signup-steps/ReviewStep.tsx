import { SignUpFormData } from '@/lib/validation';

interface ReviewStepProps {
	formData: SignUpFormData;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
	return (
		<div className="space-y-6">
			<div className="text-center mb-6">
				<h2 className="text-xl font-semibold text-gray-800">
					Vérifiez vos informations
				</h2>
				<p className="text-sm text-gray-500 mt-1">
					Confirmez avant de créer votre compte
				</p>
			</div>

			<div className="space-y-4">
				<div className="bg-gray-50 rounded-lg p-4">
					<h3 className="text-sm font-semibold text-gray-700 mb-3">
						Informations personnelles
					</h3>
					<div className="space-y-2 text-sm">
						<p>
							<span className="text-gray-600">Nom:</span>{' '}
							<span className="font-medium">
								{formData.firstName} {formData.lastName}
							</span>
						</p>
						<p>
							<span className="text-gray-600">Email:</span>{' '}
							<span className="font-medium">
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

				<div className="bg-gray-50 rounded-lg p-4">
					<h3 className="text-sm font-semibold text-gray-700 mb-3">
						Rôle
					</h3>
					<p className="text-sm">
						<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand text-white">
							{formData.userType === 'agent'
								? 'Agent immobilier'
								: 'Apporteur'}
						</span>
					</p>
				</div>

				{formData.userType === 'agent' && formData.agentType && (
					<div className="bg-gray-50 rounded-lg p-4">
						<h3 className="text-sm font-semibold text-gray-700 mb-3">
							Informations professionnelles
						</h3>
						<p className="text-sm text-gray-600 mb-2">
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
							<p className="text-sm text-gray-600">
								Carte T:{' '}
								<span className="font-medium text-gray-900">
									{formData.tCard}
								</span>
							</p>
						)}
						{formData.sirenNumber && (
							<p className="text-sm text-gray-600">
								SIREN:{' '}
								<span className="font-medium text-gray-900">
									{formData.sirenNumber}
								</span>
							</p>
						)}
						{formData.rsacNumber && (
							<p className="text-sm text-gray-600">
								RSAC:{' '}
								<span className="font-medium text-gray-900">
									{formData.rsacNumber}
								</span>
							</p>
						)}
						{formData.collaboratorCertificate && (
							<p className="text-sm text-gray-600">
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
