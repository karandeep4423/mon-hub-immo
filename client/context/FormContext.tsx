import React, { createContext, useContext } from 'react';

interface FormContextValue {
	isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue>({ isSubmitting: false });

export const useFormContext = () => {
	return useContext(FormContext);
};

interface FormProviderProps {
	isSubmitting: boolean;
	children: React.ReactNode;
	onSubmit?: (e: React.FormEvent) => void | Promise<void>;
	className?: string;
}

export const FormProvider: React.FC<FormProviderProps> = ({
	isSubmitting,
	children,
	onSubmit,
	className = '',
}) => {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit?.(e);
	};

	return (
		<FormContext.Provider value={{ isSubmitting }}>
			{onSubmit ? (
				<form onSubmit={handleSubmit} className={className}>
					{children}
				</form>
			) : (
				<div className={className}>{children}</div>
			)}
		</FormContext.Provider>
	);
};
