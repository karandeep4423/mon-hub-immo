import { Input } from '@/components/ui/Input';
import { FileUpload } from '@/components/ui/FileUpload';
import { Features } from '@/lib/constants';
import { Select } from '@/components/ui/CustomSelect';

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
		<div className="space-y-4 min-h-[300px]">
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
				<Select
					label=""
					value={agentType}
					onChange={(value: string) => {
						const event = {
							target: { name: 'agentType', value },
						} as React.ChangeEvent<HTMLSelectElement>;
						onChange(event);
					}}
					name="agentType"
					options={[
						{
							value: 'independent',
							label: 'Agent immobilier indépendant',
						},
						{
							value: 'commercial',
							label: 'Agent commercial immobilier',
						},
						{
							value: 'employee',
							label: "Négociateur VRP employé d'agence",
						},
					]}
					disabled={false}
					required={true}
				/>
				{errors.agentType && (
					<p className="mt-1 text-sm text-red-600">
						{errors.agentType}
					</p>
				)}
			</div>

			{agentType === 'independent' && (
				<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
					<Input
						label="Carte professionnelle (T card) *"
						type="text"
						name="tCard"
						value={tCard}
						onChange={onChange}
						error={errors.tCard}
						placeholder={Features.Auth.AUTH_PLACEHOLDERS.CARTE_T}
						required
					/>
					<FileUpload
						label="Carte d'identité"
						onChange={onFileChange}
						value={identityCardFile}
						helperText="Photo ou PDF de votre carte d'identité (optionnel)"
					/>
					<p className="text-xs text-gray-600">
						* Carte T requise pour agent indépendant
					</p>
				</div>
			)}

			{agentType === 'commercial' && (
				<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
					<Input
						label="Numéro SIREN *"
						type="text"
						name="sirenNumber"
						value={sirenNumber}
						onChange={onChange}
						error={errors.sirenNumber}
						placeholder={Features.Auth.AUTH_PLACEHOLDERS.SIREN}
						required
					/>
					<Input
						label="Numéro RSAC"
						type="text"
						name="rsacNumber"
						value={rsacNumber}
						onChange={onChange}
						error={errors.rsacNumber}
						placeholder={Features.Auth.AUTH_PLACEHOLDERS.RSAC}
					/>
					<FileUpload
						label="Carte d'identité"
						onChange={onFileChange}
						value={identityCardFile}
						helperText="Photo ou PDF de votre carte d'identité (optionnel)"
					/>
					<p className="text-xs text-gray-600">
						* Numéro SIREN requis pour agent commercial
					</p>
				</div>
			)}

			{agentType === 'employee' && (
				<div className="space-y-4 p-4 bg-brand-50 rounded-lg border border-brand-200">
					<Input
						label="Certificat d'autorisation *"
						type="text"
						name="collaboratorCertificate"
						value={collaboratorCertificate}
						onChange={onChange}
						error={errors.collaboratorCertificate}
						placeholder={
							Features.Auth.AUTH_PLACEHOLDERS.CERTIFICATE_REF
						}
						required
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
