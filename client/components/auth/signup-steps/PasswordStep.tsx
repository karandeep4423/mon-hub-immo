import { Input } from '@/components/ui/Input';
import { Features } from '@/lib/constants';

interface PasswordStepProps {
	password: string;
	confirmPassword: string;
	showPassword: boolean;
	showConfirmPassword: boolean;
	errors: Record<string, string>;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onTogglePassword: () => void;
	onToggleConfirmPassword: () => void;
}

export const PasswordStep: React.FC<PasswordStepProps> = ({
	password,
	confirmPassword,
	showPassword,
	showConfirmPassword,
	errors,
	onChange,
	onTogglePassword,
	onToggleConfirmPassword,
}) => {
	const getPasswordStrengthColor = () => {
		if (!password) return 'bg-gray-200';
		if (password.length < 12) return 'bg-red-400';
		if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-+=])/.test(
				password,
			)
		)
			return 'bg-yellow-400';
		return 'bg-green-400';
	};

	const getPasswordStrengthText = () => {
		if (!password) return '';
		if (password.length < 12) return 'Faible';
		if (
			!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-+=])/.test(
				password,
			)
		)
			return 'Moyen';
		return 'Fort';
	};

	return (
		<div className="space-y-4">
			<div className="text-center mb-6">
				<h2 className="text-xl font-semibold text-gray-800">
					Sécurisez votre compte
				</h2>
				<p className="text-sm text-gray-500 mt-1">
					Créez un mot de passe sécurisé
				</p>
			</div>

			<div className="relative">
				<Input
					label=""
					type={showPassword ? 'text' : 'password'}
					name="password"
					value={password}
					onChange={onChange}
					error={errors.password}
					placeholder={Features.Auth.AUTH_PLACEHOLDERS.PASSWORD}
					required
				/>
				<button
					type="button"
					onClick={onTogglePassword}
					className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
				>
					{showPassword ? (
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
							/>
						</svg>
					) : (
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
							/>
						</svg>
					)}
				</button>
			</div>

			{password && (
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<div className="flex-1 bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
								style={{
									width:
										password.length < 12
											? '33%'
											: !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-+=])/.test(
														password,
												  )
												? '66%'
												: '100%',
								}}
							></div>
						</div>
						<span className="text-xs text-gray-600 min-w-[50px]">
							{getPasswordStrengthText()}
						</span>
					</div>
					<p className="text-xs text-gray-500">
						Minimum 12 caractères, 1 majuscule, 1 minuscule, 1
						chiffre, 1 caractère spécial (@$!%*?&_-+=)
					</p>
				</div>
			)}

			<div className="relative">
				<Input
					label=""
					type={showConfirmPassword ? 'text' : 'password'}
					name="confirmPassword"
					value={confirmPassword}
					onChange={onChange}
					error={errors.confirmPassword}
					placeholder={
						Features.Auth.AUTH_PLACEHOLDERS.CONFIRM_PASSWORD
					}
					required
				/>
				<button
					type="button"
					onClick={onToggleConfirmPassword}
					className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
				>
					{showConfirmPassword ? (
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
							/>
						</svg>
					) : (
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
							/>
						</svg>
					)}
				</button>
			</div>

			{confirmPassword && (
				<div className="flex items-center space-x-2">
					{password === confirmPassword ? (
						<>
							<svg
								className="w-4 h-4 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							<span className="text-xs text-green-600">
								Les mots de passe correspondent
							</span>
						</>
					) : (
						<>
							<svg
								className="w-4 h-4 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
							<span className="text-xs text-red-600">
								Les mots de passe ne correspondent pas
							</span>
						</>
					)}
				</div>
			)}
		</div>
	);
};
