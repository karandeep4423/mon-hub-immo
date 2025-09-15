import React from 'react';

interface FormSectionProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
	title,
	description,
	children,
	className = '',
}) => {
	return (
		<div className={`space-y-4 ${className}`}>
			<div>
				<h3 className="text-lg font-medium text-gray-900">{title}</h3>
				{description && (
					<p className="text-sm text-gray-600 mt-1">{description}</p>
				)}
			</div>
			<div className="space-y-4">{children}</div>
		</div>
	);
};

interface FormFieldProps {
	label: string;
	error?: string;
	required?: boolean;
	children: React.ReactNode;
	className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
	label,
	error,
	required,
	children,
	className = '',
}) => {
	return (
		<div className={`space-y-2 ${className}`}>
			<label className="block text-sm font-medium text-gray-700">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			{children}
			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
};
