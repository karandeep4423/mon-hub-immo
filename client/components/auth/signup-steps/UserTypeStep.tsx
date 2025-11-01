interface UserTypeStepProps {
	userType: string;
	error?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UserTypeStep: React.FC<UserTypeStepProps> = ({
	userType,
	error,
	onChange,
}) => {
	return (
		<div className="space-y-6">
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-14 h-14 bg-brand rounded-2xl mb-4 shadow-brand transition-all duration-200 hover:scale-105">
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
							d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
						/>
					</svg>
				</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Choisissez votre rôle
				</h2>
				<p className="text-sm text-gray-600">
					Sélectionnez votre type de profil professionnel
				</p>
			</div>

			<div className="space-y-4">
				<label
					className={`group block p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-card ${
						userType === 'apporteur'
							? 'border-brand bg-brand-subtle shadow-brand'
							: 'border-gray-200 hover:border-brand bg-white'
					}`}
				>
					<input
						type="radio"
						name="userType"
						value="apporteur"
						checked={userType === 'apporteur'}
						onChange={onChange}
						className="sr-only"
					/>
					<div className="flex items-start">
						<div
							className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-200 ${
								userType === 'apporteur'
									? 'bg-brand text-white'
									: 'bg-gray-100 text-gray-400 group-hover:bg-brand-100 group-hover:text-brand'
							}`}
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<p className="text-lg font-bold text-gray-900 mb-1">
								Apporteur d&apos;affaires
							</p>
							<p className="text-sm text-gray-600">
								Je souhaite proposer des opportunités
								immobilières et collaborer avec des agents
							</p>
						</div>
						{userType === 'apporteur' && (
							<svg
								className="w-6 h-6 text-brand flex-shrink-0 ml-2"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						)}
					</div>
				</label>

				<label
					className={`group block p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-card ${
						userType === 'agent'
							? 'border-brand bg-brand-subtle shadow-brand'
							: 'border-gray-200 hover:border-brand bg-white'
					}`}
				>
					<input
						type="radio"
						name="userType"
						value="agent"
						checked={userType === 'agent'}
						onChange={onChange}
						className="sr-only"
					/>
					<div className="flex items-start">
						<div
							className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-all duration-200 ${
								userType === 'agent'
									? 'bg-brand text-white'
									: 'bg-gray-100 text-gray-400 group-hover:bg-brand-100 group-hover:text-brand'
							}`}
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<p className="text-lg font-bold text-gray-900 mb-1">
								Agent immobilier
							</p>
							<p className="text-sm text-gray-600">
								Je suis un professionnel de l&apos;immobilier et
								je souhaite développer mon réseau
							</p>
						</div>
						{userType === 'agent' && (
							<svg
								className="w-6 h-6 text-brand flex-shrink-0 ml-2"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
						)}
					</div>
				</label>
			</div>

			{error && (
				<p className="text-sm text-error font-medium text-center">
					{error}
				</p>
			)}
		</div>
	);
};
