import React from 'react';
import { CheckmarkIcon } from './CheckmarkIcon';
import {
	STEP_INDICATOR_COLORS,
	StepIndicatorState,
} from '../../lib/constants/statusColors';

interface StepIndicatorProps {
	state: StepIndicatorState;
	icon?: string;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
	state,
	icon,
	size = 'md',
	className = '',
}) => {
	const sizeClasses = {
		sm: 'w-8 h-8 text-sm',
		md: 'w-10 h-10 text-sm',
		lg: 'w-12 h-12 text-base',
	};

	const colorClass = STEP_INDICATOR_COLORS[state];

	return (
		<div
			className={`flex items-center justify-center rounded-full font-medium ${sizeClasses[size]} ${colorClass} ${className}`}
		>
			{state === 'completed' ? (
				<CheckmarkIcon size={size === 'sm' ? 'sm' : 'md'} />
			) : (
				<span>{icon}</span>
			)}
		</div>
	);
};
