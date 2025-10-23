interface FormSectionProps {
	title: string;
	emoji?: string;
	children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
	title,
	emoji,
	children,
}) => {
	return (
		<div className="bg-white p-6 rounded-lg shadow-sm border">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				{emoji && `${emoji} `}
				{title}
			</h3>
			{children}
		</div>
	);
};
