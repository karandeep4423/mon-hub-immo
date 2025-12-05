import React from 'react';

interface ReadOnlyFieldProps {
	label: string;
	value: string | number;
	helperText?: string;
	className?: string;
}

export const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
	label,
	value,
	helperText,
	className = '',
}) => {
	return (
		<div className={className}>
			<label className="block text-sm font-medium text-gray-700 mb-1">
				{label}
			</label>
			<div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700">
				{value}
			</div>
			{helperText && (
				<p className="text-xs text-gray-500 mt-1">{helperText}</p>
			)}
		</div>
	);
};
