import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { AUTH_TEXT } from '@/lib/constants/text';

interface AgentProfessionalInfoStepProps {
	agentType: string;
	tCard: string;
	sirenNumber: string;
	rsacNumber: string;
	collaboratorCertificate: string;
	identityCardFile: File | null;
	errors: Record<string, string>;
	onChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onFileChange: (file: File | null) => void;
}

export const AgentProfessionalInfoStep: React.FC<
	AgentProfessionalInfoStepProps
> = ({
	agentType,
	tCard,
	sirenNumber,
	rsacNumber,
	collaboratorCertificate,
	identityCardFile,
	errors,
	onChange,
	onFileChange,
}) => {
	return (
		<div className="space-y-4">
			<div className="text-center mb-6">
				<h2 className="text-xl font-semibold text-gray-800">
					Informations professionnelles
				</h2>
				<p className="text-sm text-gray-500 mt-1">
					Détails de votre activité d&apos;agent
				</p>
			</div>

			<div>
				<label
					htmlFor="agentType"
					className="block text-sm font-semibold text-gray-700 mb-2"
				>
					Type d&apos;agent immobilier *
				</label>
				<select
					id="agentType"
					name="agentType"
					value={agentType}
					onChange={onChange}
					className={`block w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all duration-200 ${
						agentType === '' ? 'text-gray-400' : 'text-gray-900'
					}`}
					required
				>
					<option value="" disabled className="text-gray-400">
						Choisissez votre type d&apos;agent
					</option>
					<option value="independent" className="text-gray-900">
						Agent immobilier indépendant
					</option>
					<option value="commercial" className="text-gray-900">
						Agent commercial immobilier
					</option>
					<option value="employee" className="text-gray-900">
						Négociateur VRP employé d&apos;agence
					</option>
				</select>
				{errors.agentType && (
					<p className="mt-1 text-sm text-red-600">
						{errors.agentType}
					</p>
				)}
			</div>

			{agentType === 'independent' && (
				<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
					<Input
						label="Carte professionnelle (T card)"
						type="text"
						name="tCard"
						value={tCard}
						onChange={onChange}
						error={errors.tCard}
						placeholder="Numéro de carte T"
					/>
					<Input
						label="Numéro SIREN"
						type="text"
						name="sirenNumber"
						value={sirenNumber}
						onChange={onChange}
						error={errors.sirenNumber}
						placeholder="Numéro SIREN"
					/>
					<FileUpload
						label="Carte d'identité"
						onChange={onFileChange}
						value={identityCardFile}
						helperText="Photo ou PDF de votre carte d'identité (optionnel)"
					/>
					<p className="text-xs text-gray-600">
						* Au moins une carte T ou un numéro SIREN requis
					</p>
				</div>
			)}

			{agentType === 'commercial' && (
				<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
					<Input
						label="Numéro SIREN"
						type="text"
						name="sirenNumber"
						value={sirenNumber}
						onChange={onChange}
						error={errors.sirenNumber}
						placeholder="Numéro SIREN"
					/>
					<Input
						label={AUTH_TEXT.rsacNumber}
						type="text"
						name="rsacNumber"
						value={rsacNumber}
						onChange={onChange}
						error={errors.rsacNumber}
						placeholder="Numéro RSAC"
					/>
					<FileUpload
						label="Carte d'identité"
						onChange={onFileChange}
						value={identityCardFile}
						helperText="Photo ou PDF de votre carte d'identité (optionnel)"
					/>
					<p className="text-xs text-gray-600">
						* Au moins un numéro SIREN ou RSAC requis
					</p>
				</div>
			)}

			{agentType === 'employee' && (
				<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
					<Input
						label="Certificat d'autorisation"
						type="text"
						name="collaboratorCertificate"
						value={collaboratorCertificate}
						onChange={onChange}
						error={errors.collaboratorCertificate}
						placeholder="Référence du certificat"
					/>
					<FileUpload
						label="Carte d'identité"
						onChange={onFileChange}
						value={identityCardFile}
						helperText="Photo ou PDF de votre carte d'identité (optionnel)"
					/>
					<p className="text-xs text-gray-600">
						* Certificat d&apos;autorisation de votre employeur
						requis
					</p>
				</div>
			)}
		</div>
	);
};
