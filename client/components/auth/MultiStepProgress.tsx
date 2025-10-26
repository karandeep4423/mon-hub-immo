'use client';

import React from 'react';

interface Step {
	id: number;
	label: string;
}

interface StepIndicatorProps {
	steps: Step[];
	currentStep: number;
}

export const MultiStepProgress: React.FC<StepIndicatorProps> = ({
	steps,
	currentStep,
}) => {
	return (
		<div className="w-full max-w-3xl mx-auto px-4 py-6">
			<div className="relative">
				{/* Progress Line */}
				<div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
					<div
						className="h-full bg-brand transition-all duration-500 ease-out"
						style={{
							width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
						}}
					/>
				</div>

				{/* Steps */}
				<div className="relative flex justify-between">
					{steps.map((step) => {
						const isCompleted = currentStep > step.id;
						const isCurrent = currentStep === step.id;
						const isPending = currentStep < step.id;

						return (
							<div
								key={step.id}
								className="flex flex-col items-center"
							>
								{/* Step Circle */}
								<div
									className={`
										w-10 h-10 rounded-full flex items-center justify-center
										font-semibold text-sm transition-all duration-300
										${isCompleted ? 'bg-brand text-white scale-100' : ''}
										${isCurrent ? 'bg-brand text-white scale-110 ring-4 ring-brand-100' : ''}
										${isPending ? 'bg-white border-2 border-gray-300 text-gray-400' : ''}
									`}
								>
									{isCompleted ? (
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
												d="M5 13l4 4L19 7"
											/>
										</svg>
									) : (
										step.id
									)}
								</div>

								{/* Step Label */}
								<div
									className={`
										mt-2 text-xs sm:text-sm font-medium text-center max-w-[80px] sm:max-w-none
										transition-colors duration-300
										${isCurrent ? 'text-brand' : ''}
										${isCompleted ? 'text-gray-700' : ''}
										${isPending ? 'text-gray-400' : ''}
									`}
								>
									{step.label}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
