import { Input } from '@/components/ui/Input';
import { Features } from '@/lib/constants';

interface BasicInfoStepProps {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	errors: Record<string, string>;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
	firstName,
	lastName,
	email,
	phone,
	errors,
	onChange,
}) => {
	return (
		<div className="space-y-5">
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl mb-4">
					<svg
						className="w-7 h-7 text-white"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
				</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Informations personnelles
				</h2>
				<p className="text-sm text-gray-600">
					Commençons par vos informations de base
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Input
					label=""
					type="text"
					name="firstName"
					value={firstName}
					onChange={onChange}
					error={errors.firstName}
					placeholder={Features.Auth.AUTH_PLACEHOLDERS.FIRST_NAME}
					required
				/>{' '}
				<Input
					label=""
					type="text"
					name="lastName"
					value={lastName}
					onChange={onChange}
					error={errors.lastName}
					placeholder="Nom *"
					required
				/>
			</div>
			<Input
				label=""
				type="email"
				name="email"
				value={email}
				onChange={onChange}
				error={errors.email}
				placeholder={Features.Auth.AUTH_PLACEHOLDERS.EMAIL}
				required
			/>{' '}
			<Input
				label=""
				type="tel"
				name="phone"
				value={phone}
				onChange={onChange}
				error={errors.phone}
				placeholder="Téléphone * (ex: 0123456789)"
				required
			/>
		</div>
	);
};
