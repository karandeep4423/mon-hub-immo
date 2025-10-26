import React from 'react';
import { StepStatusIndicator } from '../ui/StepStatusIndicator';

interface CollaborationProgressProps {
	currentStep: 'proposal' | 'contract_signing' | 'active' | 'completed';
	status:
		| 'pending'
		| 'accepted'
		| 'active'
		| 'completed'
		| 'cancelled'
		| 'rejected';
}

export const CollaborationProgress: React.FC<CollaborationProgressProps> = ({
	currentStep,
	status,
}) => {
	const steps = [
		{
			key: 'proposal',
			title: 'Proposition',
			description: 'Proposition envoyée',
		},
		{
			key: 'contract_signing',
			title: 'Signature',
			description: 'Signature du contrat',
		},
		{
			key: 'active',
			title: 'Active',
			description: 'Collaboration active',
		},
		{
			key: 'completed',
			title: 'Terminée',
			description: 'Collaboration terminée',
		},
	];

	const getStepStatus = (stepKey: string, index: number) => {
		const currentIndex = steps.findIndex(
			(step) => step.key === currentStep,
		);

		if (status === 'rejected' || status === 'cancelled') {
			return index === 0 ? 'completed' : 'inactive';
		}

		if (index < currentIndex) return 'completed';
		if (index === currentIndex) return 'current';
		return 'upcoming';
	};

	const getStepClasses = (stepStatus: string) => {
		switch (stepStatus) {
			case 'completed':
				return {
					text: 'text-green-600',
					connector: 'bg-green-600',
				};
			case 'current':
				return {
					text: 'text-blue-600',
					connector: 'bg-gray-200',
				};
			case 'upcoming':
				return {
					text: 'text-gray-500',
					connector: 'bg-gray-200',
				};
			default:
				return {
					text: 'text-gray-400',
					connector: 'bg-gray-200',
				};
		}
	};

	return (
		<div className="py-4">
			<nav aria-label="Progress">
				<ol className="flex items-center">
					{steps.map((step, index) => {
						const stepStatus = getStepStatus(step.key, index);
						const classes = getStepClasses(stepStatus);

						return (
							<li
								key={step.key}
								className={`relative ${index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}
							>
								{/* Connector */}
								{index !== steps.length - 1 && (
									<div
										className="absolute inset-0 flex items-center"
										aria-hidden="true"
									>
										<div
											className={`h-0.5 w-full ${classes.connector}`}
										/>
									</div>
								)}

								{/* Step */}
								<div className="relative flex items-center justify-center">
									<StepStatusIndicator
										state={
											stepStatus === 'completed'
												? 'completed'
												: stepStatus === 'current'
													? 'current'
													: 'upcoming'
										}
										icon={`${index + 1}`}
										size="sm"
									/>
								</div>

								{/* Step info */}
								<div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center min-w-max">
									<div
										className={`text-xs font-medium ${classes.text}`}
									>
										{step.title}
									</div>
									<div className="text-xs text-gray-500 mt-1">
										{step.description}
									</div>
								</div>
							</li>
						);
					})}
				</ol>
			</nav>
		</div>
	);
};
